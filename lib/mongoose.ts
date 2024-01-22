import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
	//set strict mode to prevent unknown fields from being added to the database
	mongoose.set("strict", true);

	if (!process.env.MONGODB_URI) {
		throw new Error("=> MONGODB_URI is undefined.");
	}

	if (isConnected) return console.log("=> using existing database connection");

	//connecting to the database
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		isConnected = true;

		console.log("=> using new database connection");
	} catch (error) {
		console.log("=> error while connecting to the database:", error);
	}
};
