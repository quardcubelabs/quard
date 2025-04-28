import "./load-env"
import { updateProductImages } from "../lib/generate-product-images"

async function main() {
  console.log("Updating product images...")
  await updateProductImages()
  console.log("Done!")
  process.exit(0)
}

main().catch((error) => {
  console.error("Error:", error)
  process.exit(1)
}) 