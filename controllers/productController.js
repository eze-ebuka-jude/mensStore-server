import Product from "../models/productModel.js";
import AppError from "../utils/appError.js";

export const createProduct = async (req, res, next) => {
  const {
    name,
    description,
    price,
    discountPrice,
    countInStock,
    category,
    brand,
    sizes,
    colors,
    collections,
    material,
    gender,
    images,
    isFeatured,
    isPublished,
    tags,
    dimensions,
    weight,
    sku,
  } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id,
    });

    const newProduct = await product.save();
    res.status(200).json({
      status: "success",
      data: newProduct,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to create product!", 500));
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      collection,
      size,
      color,
      gender,
      minPrice,
      maxPrice,
      sortBy,
      search,
      category,
      material,
      brand,
      limit,
    } = req.query;

    let query = {};

    //Filter logic
    if (collection && collection.toLocaleLowerCase() !== "all")
      query.collections = collection;

    if (category && category.toLocaleLowerCase() !== "all")
      query.category = category;

    if (material) query.material = { $in: material.split(",") };
    if (brand) query.brand = { $in: brand.split(",") };
    if (size) query.sizes = { $in: size.split(",") };
    if (color) query.colors = { $in: [color] };
    if (gender) query.gender = gender;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    //Sort Logic
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case "priceAsc":
          sort = { price: 1 };
          break;
        case "priceDesc":
          sort = { price: -1 };
          break;
        case "popularity":
          sort = { rating: -1 };
          break;
        default:
          break;
      }
    }

    //Fetch products and apply sorting and limit
    let products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit) || 0);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to get products!", 500));
  }
};

export const getBestSeller = async (req, res, next) => {
  try {
    const bestSeller = await Product.findOne().sort({ rating: -1 });
    if (!bestSeller) return next(new AppError("No best seller found!", 404));

    res.status(200).json(bestSeller);
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to get best seller!", 500));
  }
};

export const getNewArrivals = async (req, res, next) => {
  try {
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
    if (!newArrivals) return next(new AppError("No best seller found!", 404));

    res.status(200).json(newArrivals);
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to get new arrivals!", 500));
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const singleProd = await Product.findById(id);
    if (!singleProd)
      return next(new AppError("Product with the ID not found!", 404));

    res.status(200).json({
      status: "success",
      data: singleProd,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to get single product!", 500));
  }
};

export const getSimilarProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product)
      return next(new AppError("Product with the ID not found!", 404));

    const similarProducts = await Product.find({
      _id: { $ne: id },
      gender: product.gender,
      category: product.category,
    }).limit(4);

    res.status(200).json(similarProducts);
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while getting similar products", 500));
  }
};

export const updateProduct = async (req, res, next) => {
  const {
    name,
    description,
    price,
    discountPrice,
    countInStock,
    category,
    brand,
    sizes,
    colors,
    collections,
    material,
    gender,
    images,
    isFeatured,
    isPublished,
    tags,
    dimensions,
    weight,
    sku,
  } = req.body;

  try {
    const { id } = req.params;
    const updatedProduct = await Product.findById(id);

    if (updatedProduct) {
      updatedProduct.name = name || updatedProduct.name;
      updatedProduct.description = description || updatedProduct.description;
      updatedProduct.price = price || updatedProduct.price;
      updatedProduct.discountPrice =
        discountPrice || updatedProduct.discountPrice;
      updatedProduct.countInStock = countInStock || updatedProduct.countInStock;
      updatedProduct.category = category || updatedProduct.category;
      updatedProduct.brand = brand || updatedProduct.brand;
      updatedProduct.sizes = sizes || updatedProduct.sizes;
      updatedProduct.colors = colors || updatedProduct.colors;
      updatedProduct.collections = collections || updatedProduct.collections;
      updatedProduct.material = material || updatedProduct.material;
      updatedProduct.gender = gender || updatedProduct.gender;
      updatedProduct.images = images || updatedProduct.images;
      updatedProduct.isFeatured =
        isFeatured !== undefined ? isFeatured : updatedProduct.isFeatured;
      updatedProduct.isPublished =
        isPublished !== undefined ? isPublished : updatedProduct.isPublished;
      updatedProduct.tags = tags || updatedProduct.tags;
      updatedProduct.dimensions = dimensions || updatedProduct.dimensions;
      updatedProduct.weight = weight || updatedProduct.weight;
      updatedProduct.sku = sku || updatedProduct.sku;

      const product = await updatedProduct.save();
      res.json(product);
    } else {
      return next(new AppError("Product with the id is not found!", 404));
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to update product", 500));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doc = await Product.findByIdAndDelete(id);
    if (!doc) return next(new AppError("No product found with the ID", 404));

    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while deleting product!", 500));
  }
};
