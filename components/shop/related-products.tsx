import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/product-actions"

type RelatedProductsProps = {
  products: Product[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <Link key={product.id} href={`/shop/${product.id}`} className="group">
          <div className="rounded-2xl border-2 border-navy/20 bg-white/50 overflow-hidden transition-all duration-300 hover:border-navy hover:shadow-lg">
            <div className="relative h-48 overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-navy group-hover:text-brand-red transition-colors">
                {product.name}
              </h3>
              <p className="text-navy/80 font-medium mt-2">${Number(product.price).toFixed(2)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 