import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function cleanText(value: unknown) {
  return String(value || '').trim();
}

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!product) return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const name = cleanText(body.name);
    const sku = cleanText(body.sku).toUpperCase();
    const category = cleanText(body.category);
    const price = Number(body.price || 0);
    const minStock = Number(body.minStock || 0);
    const imageUrl = cleanText(body.imageUrl);
    const description = cleanText(body.description);
    const isActive = Boolean(body.isActive);

    if (!name) return NextResponse.json({ message: 'Nama produk wajib diisi' }, { status: 400 });
    if (!sku) return NextResponse.json({ message: 'SKU wajib diisi' }, { status: 400 });
    if (!category) return NextResponse.json({ message: 'Kategori produk wajib diisi' }, { status: 400 });
    if (price < 0) return NextResponse.json({ message: 'Harga tidak boleh negatif' }, { status: 400 });
    if (minStock < 0) return NextResponse.json({ message: 'Minimum stok tidak boleh negatif' }, { status: 400 });

    const product = await prisma.product.update({
      where: { id },
      data: {
        sku,
        name,
        category,
        price,
        minStock,
        imageUrl: imageUrl || null,
        description: description || null,
        isActive,
      },
    });

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error(error);

    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    }

    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ message: 'SKU sudah digunakan produk lain' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Gagal memperbarui produk' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error(error);

    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Gagal menghapus produk' }, { status: 500 });
  }
}
