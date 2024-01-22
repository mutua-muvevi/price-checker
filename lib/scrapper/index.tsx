import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
	if (!url) return;

	// curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_4fdacc87-zone-unblocker:gov0bn0mutp6 -k https://lumtest.com/myip.json

	//Bright data scrapping configuration
	const username = process.env.BRIGHT_DATA_USERNAME;
	const password = process.env.BRIGHT_DATA_PASSWORD;

	const port = 22225;
	const session_id = (1000000 * Math.random()) | 0;

	// Ensure password is defined before using it
    if (!password) {
        throw new Error("Bright Data password is not defined");
    }

	const options = {
		auth: {
			username: `${username}-session-${session_id}`,
			password,
		},
		host: "brd.superproxy.io",
		rejectUnauthorized: false,
		port,
	};

	try {
		//fetch the product page
		const response = await axios.get(url, options);

		//parsing the result
		const $ = cheerio.load(response.data);

		//get the product title
		const title = $("#productTitle").text().trim();
		const currentPrice = extractPrice(
			$(".priceToPay span.a-price-whole"),
			$("a.size.base.a-color-price"),
			$(".a-button-selected .a-color-base"),
			$("a.price .a-text-price")
		);

		const originalPrice = extractPrice(
			$('#priceblock_ourprice'),
			$('.a-price.a-text-price span.a-offscreen'),
			$('#listPrice'),
			$('#priceblock_dealprice'),
			$('.a-size-base.a-color-price')
		);

		const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

		const images = 
		  $('#imgBlkFront').attr('data-a-dynamic-image') || 
		  $('#landingImage').attr('data-a-dynamic-image') ||
		  '{}'
	
		const imageUrls = Object.keys(JSON.parse(images));
	
		const currency = extractCurrency($('.a-price-symbol'))
		const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
	
		const description = extractDescription($)

		
		//construct data object with sraped data
		const data = {
			url,
			currency: currency || "$",
			image: imageUrls[0],
			title,
			priceHistory: [],
			discountRate,
			category: "category",
			description,
			reviewsCount: 0,
			stars: 0,
			isOutOfStock: outOfStock,
			originalPrice: Number(originalPrice) || Number(currentPrice),
			currentPrice: Number(currentPrice) || Number(originalPrice),
			lowerPrice: Number(currentPrice) || Number(originalPrice),
			highestPrice: Number(originalPrice) || Number(currentPrice) ,
			average: Number(currentPrice) || Number(originalPrice),
		}

		return data;
		
	} catch (error: any) {
		throw new Error(`Failed to scrape product: ${error.message}`);
	}
}
