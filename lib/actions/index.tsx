"use server";

import { revalidatePath } from "next/cache"; //helps us to revalidate the cache
import Product from "../models/product";
import { connectToDatabase } from "../mongoose";
import { scrapeAmazonProduct } from "../scrapper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { User } from "@/types";

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


//get the product by id
export async function getProductById(productId: string) {
	try {
		connectToDatabase();

		const product = await Product.findOne({ _id: productId });

		if(!product) return null;

		return product;
		
	} catch (error) {
		console.log(error)
	}
}

//get all products
export async function getAllProducts() {
	try {
		connectToDatabase();

		const products = await Product.find({});

		if(!products) return null;

		return products;
		
	} catch (error) {
		console.log(error)
	}
}


export async function getSimilarProducts(productId: string) {
	try {
	  connectToDatabase();
  
	  const currentProduct = await Product.findById(productId);
  
	  if(!currentProduct) return null;
  
	  const similarProducts = await Product.find({
		_id: { $ne: productId },
	  }).limit(3);
  
	  return similarProducts;
	} catch (error) {
	  console.log(error);
	}
  }
  
  export async function addUserEmailToProduct(productId: string, userEmail: string) {
	try {
	  const product = await Product.findById(productId);
  
	  if(!product) return;
  
	  const userExists = product.users.some((user: User) => user.email === userEmail);
  
	  if(!userExists) {
		product.users.push({ email: userEmail });
  
		await product.save();
  
		const emailContent = await generateEmailBody(product, "WELCOME");
  
		await sendEmail(emailContent, [userEmail]);
	  }
	} catch (error) {
	  console.log("Catch error", error);
	}
  }