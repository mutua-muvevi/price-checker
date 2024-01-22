"use server";
import { scrapeAmazonProduct } from "../scrapper";

 //use server enables us to use server side functions

export async function scrapeAndStoreProduct(productUrl: string){
	if(!productUrl) return;

	try {
		const scrappedProduct = await scrapeAmazonProduct(productUrl);

		if(!scrappedProduct) return;
	} catch (error: any) {
		throw new Error(`Failed to create/update product: ${error.message}`);
	}
}