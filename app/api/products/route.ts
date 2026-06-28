import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function cleanText(value: unknown) {
  return String(value || '').trim();
}

function cleanSku(value: unknown, name: string) {
  const raw = cleanText(value);
  if (raw) return raw.toUpperCase();

  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 18) || 'PRODUK';

  return `${base}-${Date.now().toString().slice(-6)}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = cleanText(searchParams.get('q'));
  const category = cleanText(searchParams.get('category'));
  const status = cleanText(searchParams.get('status'));

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(status === 'active' ? { isActive: true } : {}),
      ...(status === 'inactive' ? { isActive: false } : {}),
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
    orderBy: { updatedAt: 'desc' },
    take: 300,
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = cleanText(body.name);
    const category = cleanText(body.category);
    const sku = cleanSku(body.sku, name);
    const price = Number(body.price || 0);
    const stock = Number(body.stock || 0);
    const minStock = Number(body.minStock || 0);
    const imageUrl = cleanText(body.imageUrl);
    const description = cleanText(body.description);

    if (!name) return NextResponse.json({ message: 'Nama produk wajib diisi' }, { status: 400 });
    if (!category) return NextResponse.json({ message: 'Kategori produk wajib diisi' }, { status: 400 });
    if (price < 0) return NextResponse.json({ message: 'Harga tidak boleh negatif' }, { status: 400 });
    if (stock < 0) return NextResponse.json({ message: 'Stok tidak boleh negatif' }, { status: 400 });
    if (minStock < 0) return NextResponse.json({ message: 'Minimum stok tidak boleh negatif' }, { status: 400 });

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          sku,
          name,
          category,
          price,
          stock,
          minStock,
          imageUrl: imageUrl || null,
          description: description || null,
        },
      });

      if (stock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: created.id,
            type: 'ADJUSTMENT',
            quantity: stock,
            stockBefore: 0,
            stockAfter: stock,
            note: 'Stok awal produk',
            actorName: 'Admin',
          },
        });
      }

      return created;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error(error);

    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ message: 'SKU sudah digunakan produk lain' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Gagal menyimpan produk' }, { status: 500 });
  }
}
