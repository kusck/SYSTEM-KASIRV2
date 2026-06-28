import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type StockStatus = 'all' | 'available' | 'low' | 'out';
type StockMovementInput = 'IN' | 'OUT' | 'ADJUSTMENT';

function cleanText(value: unknown) {
  return String(value || '').trim();
}

function getStockStatus(stock: number, minStock: number) {
  if (stock <= 0) return 'out';
  if (stock <= minStock) return 'low';
  return 'available';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = cleanText(searchParams.get('q'));
  const status = (cleanText(searchParams.get('status')) || 'all') as StockStatus;

  const products = await prisma.product.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { sku: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { name: 'asc' },
    take: 300,
  });

  const mapped = products
    .map((product) => ({
      ...product,
      stockStatus: getStockStatus(product.stock, product.minStock),
    }))
    .filter((product) => status === 'all' || product.stockStatus === status);

  const summary = mapped.reduce(
    (acc, product) => ({
      totalProducts: acc.totalProducts + 1,
      totalStock: acc.totalStock + product.stock,
      lowStock: acc.lowStock + (product.stockStatus === 'low' ? 1 : 0),
      outOfStock: acc.outOfStock + (product.stockStatus === 'out' ? 1 : 0),
      inventoryValue: acc.inventoryValue + product.price * product.stock,
    }),
    { totalProducts: 0, totalStock: 0, lowStock: 0, outOfStock: 0, inventoryValue: 0 },
  );

  return NextResponse.json({ products: mapped, summary });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = cleanText(body.productId);
    const type = cleanText(body.type) as StockMovementInput;
    const quantity = Number(body.quantity || 0);
    const note = cleanText(body.note);
    const actorName = cleanText(body.actorName) || 'Admin';

    if (!productId) return NextResponse.json({ message: 'Produk wajib dipilih' }, { status: 400 });
    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) return NextResponse.json({ message: 'Jenis mutasi stok tidak valid' }, { status: 400 });
    if (type === 'ADJUSTMENT' && quantity < 0) return NextResponse.json({ message: 'Stok akhir tidak boleh negatif' }, { status: 400 });
    if (type !== 'ADJUSTMENT' && quantity <= 0) return NextResponse.json({ message: 'Jumlah stok wajib lebih dari 0' }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('PRODUCT_NOT_FOUND');

      const stockBefore = product.stock;
      const stockAfter =
        type === 'IN'
          ? stockBefore + quantity
          : type === 'OUT'
            ? stockBefore - quantity
            : quantity;

      if (stockAfter < 0) throw new Error('NEGATIVE_STOCK');

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity: type === 'ADJUSTMENT' ? Math.abs(stockAfter - stockBefore) : quantity,
          stockBefore,
          stockAfter,
          note: note || null,
          actorName,
        },
      });

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: stockAfter },
      });

      return { movement, product: updatedProduct };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    }

    if (error instanceof Error && error.message === 'NEGATIVE_STOCK') {
      return NextResponse.json({ message: 'Stok tidak boleh menjadi negatif' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Gagal menyimpan mutasi stok' }, { status: 500 });
  }
}
