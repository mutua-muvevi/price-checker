"use server";

import { revalidatePath } from "next/cache"; //helps us to revalidate the cache
import Product from "../models/product";
import { connectToDatabase } from "../mongoose";
import { scrapeAmazonProduct } from "../scrapper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

//use server enables us to use server side functions

//scrape and store product
export async function scrapeAndStoreProduct(productUrl: string) {
	if (!productUrl) return;

	try {
		connectToDatabase();

		const scrappedProduct = await scrapeAmazonProduct(productUrl);

		if (!scrappedProduct) return;

		let product = scrappedProduct

		//check if product exists in db
		const existingProduct = await Product.findOne({ url: productUrl });

		//if existing product exists, update the price hostory
		if (existingProduct) {
			const updatePriceHistory: any = [
				...existingProduct.priceHistory,
				{ price: scrappedProduct.currentPrice },
			];

			product = {
				...scrappedProduct,
				priceHistory: updatePriceHistory,
				lowestPrice: getLowestPrice(updatePriceHistory),
				highestPrice: getHighestPrice(updatePriceHistory),
				averagePrice: getAveragePrice(updatePriceHistory),
			}
		}

		//create or update product
		const newProduct = await Product.findOneAndUpdate(
			{ url: productUrl },
			product,
			{ new: true, upsert: true }
		);

		//revalidate the cache
		revalidatePath(`/products/${newProduct._id}`);

	} catch (error: any) {
		throw new Error(`Failed to create/update product: ${error.message}`);
	}
}


//fetch tyhe product by id
export async function fetchProductById(productId: string) {
	try {
		connectToDatabase();

		const product = await Product.findOne({ _id: productId });

		if(!product) return null;

		return product;
		
	} catch (error) {
		console.log(error)
	}
}