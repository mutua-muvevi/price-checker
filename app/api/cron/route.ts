import Product from "@/lib/models/product"
import { connectToDatabase } from "@/lib/mongoose"
import { generateEmailBody, sendEmail } from "@/lib/nodemailer"
import { scrapeAmazonProduct } from "@/lib/scrapper"
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils"
import { NextResponse } from "next/server"

//================file conventions/route segment configuration
export const maxDuration = 300; // 5 minutes
export const dynamic = true;
export const revalidate = 0;

//================

export async function GET () {
	try {
		connectToDatabase()

		//fecth all products
		const products = await Product.find({})

		if(!products) throw new Error("No products found")

		// oput first cron job
		//crape latest product details and update details in the database
		const updatedProduct = await Promise.all(
			//first async action
			products.map(async (currentProduct) => {
				let scrappedProduct = await scrapeAmazonProduct(currentProduct.url)

				if(!scrappedProduct) throw new Error("No product found")

				const updatePriceHistory: any = [
					...currentProduct.priceHistory,
					{ price: scrappedProduct.currentPrice },
				];
				
		
				const product = {
					...scrappedProduct,
					priceHistory: updatePriceHistory,
					lowestPrice: getLowestPrice(updatePriceHistory),
					highestPrice: getHighestPrice(updatePriceHistory),
					averagePrice: getAveragePrice(updatePriceHistory),
				}
			
		
				//create or update product
				const updatedProduct = await Product.findOneAndUpdate(
					{ url: product.url },
					product,
				);

				//check price status
				const emailNotifType = getEmailNotifType(scrappedProduct, currentProduct);

				if(emailNotifType && updatedProduct.user.length > 0){
					const productInfo = {
						title: updatedProduct.title,
						url: updatedProduct.url,
					}

					//generate email body
					const emailContent = await generateEmailBody(productInfo, emailNotifType)

					//get all the user emails in the product user array
					const userEmails = updatedProduct.user.map((user: any) => user.email)

					//send email
					await sendEmail(emailContent, userEmails)
				}

				return updatedProduct
			})
		)

		return NextResponse.json({
			message: "Cron job ran successfully",
			data: updatedProduct,
		})

	} catch (error: any) {
		throw new Error(`Error in get cron: ${error}`)
	}
}