import mongoose from "mongoose";

const { Schema } = mongoose;

const SchemaOptions = {
	  timestamps: true,
	  collection: "Product"
};

//the schema definition
const ProductSchema = new Schema({
	url: { type: String, required: true, unique: true, index: true },
	currency: { type: String, required: true },
	image: { type: String, required: true },
	title: { type: String, required: true },
	currentPrice: { type: Number, required: true },
	originalPrice: { type: Number, required: true },
	priceHistory: [
		{
			date: { type: Date, default : Date.now},
			price: { type: Number, required: true }
		}
	],
	lowestPrice: { type: Number},
	highestPrice: { type: Number},
	averagePrice: { type: Number},
	discountRate: { type: Number},
	description: { type: String},
	category: { type: String},
	reviewsCount: { type: Number},
	isOutOfStock: { type: Boolean},
	users: [
		{ email: { type: String, required: true } }
	]
}, SchemaOptions);

// the model definition
const Product =  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;