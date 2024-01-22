"use client"; //use client enables us to use client interactivity
import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react";

const isValidAmazonProductUrl = (url: string) => {
	try {
		//parse the string to url
		const parseUrl = new URL(url);

		//get the hostname
		const hostname = parseUrl.hostname;

		//check if the hostname is amazon
		if (
			hostname.includes("amazon") ||
			hostname.includes("amazon") ||
			hostname.includes("amazon.") ||
			hostname.endsWith("amazon")
		) {
			return true;
		}
	} catch (error) {
		console.log("Error from isValidAmazonProductUrl:", error);
		return false;
	}
	return false;
};

const Searchbar = () => {
	const [searchPrompt, setSearchPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		//check if link is valid
		const isValidLink = isValidAmazonProductUrl(searchPrompt);

		if (!isValidLink) {
			alert("Please enter a valid Amazon product URL");
			return;
		}

		try {
			setIsLoading(true);

			// Scrape the product page
			const product = await scrapeAndStoreProduct(searchPrompt);

		} catch (error) {
			console.log("Error from handleSubmit:", error)
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
			<input
				type="text"
				className="searchbar-input"
				placeholder="Search for products, brands, and more"
				onChange={(e) => setSearchPrompt(e.target.value)}
				value={searchPrompt}
			/>
			<button type="submit" className="searchbar-btn" disabled={searchPrompt === ""}>
				{isLoading ? "Searching..." : "Search"}
			</button>
		</form>
	);
};

export default Searchbar;
