const express=require('express')
const bcrypt=require('bcrypt')
const Customer=require("../models/customerModel")
const productCategory = require('../models/productCategory')
const product = require('../models/productModel')



const loadAdminLogin=async(req,res)=>{
    try{
        if(!req.session.admin){
            res.render("admin/adminlogin")
        }else{
            res.redirect("admin/dashboard")
        }
    }catch(error){
        console.log(error.message);
    }
}

const loginValidation=async (req,res,next)=>{
    try{
        const{email,password} =req.body
        if(email===""){
            res.render("admin/adminLogin",{message:"Email required"})
        }else if(password===""){
            res.render("admin/adminLogin",{message:"password is required"})
        }else{
            next()
        }
    }catch(error){
        console.log(error.message);
    }
}

const adminValid=async(req,res)=>{
    try {
        const { email, password } = req.body
        const validEmail = await Customer.findOne({ email })


        if (!validEmail || validEmail === "undefined" || validEmail === null || validEmail === "") {

            return res.render("admin/adminLogin", { message: "email is not valid" })

        } else if (!/^\S+@\S+\.\S+$/.test(email) || email === "") {
            res.render("admin/adminLogin", { message: "Invalid Email " })
        } else {
                 const dpassword= validEmail.password
                 const matchPassword=await bcrypt.compare(password,dpassword)
           if(!matchPassword){
            res.render("admin/adminLogin",{message:"password is miss match"})
           }else{
              if(validEmail.is_Admin===true){
                req.session.admin=validEmail._id
                res.redirect("/admin/dashboard")
              }else{
                res.render("admin/adminLogin",{message:"you are not admin"})
              }
           }
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadDash=async (req,res)=>{
    try{
        res.render("admin/dashboard")
    }catch(error){
        console.log(error.message);
    }
}
 
const adminLogout=(req,res)=>{
    try{
        if(req.session.admin){
            req.session.destroy()
            res.redirect("/admin/dashboard")
        }
    }catch(error){
        console.log(error.message);
    }
}




 // CUSTOMERS
 const displayCustomers= async(req,res)=>{
    const {query}=req.query
    console.log(req.query);
    try{
         let users;
         if(query){
            users=await Customer.find({
                name:{ $regex: '.*' + query + '.*' },
                is_Admin:false,
                is_varified:true
            })
            if(users.length>0){
                return res.render("admin/users",{users,query})
            }
         }else{
            users=await Customer.find({is_varified:true,is_Admin:false})
            if(users.length>0){
                return res.render("admin/users",{users,query})
            }
         }
    }catch(error){
        console.log(error.message);
    }
 }

 const UnblockTheUser=async (req,res)=>{
    try{
        const {id} =req.query
        const userUpdated1=await Customer.updateOne({_id:id},{$set:{is_block:false}})
        if(userUpdated1){
            return res.redirect('/admin/customers')
        }
    }catch(error){
        console.log(error.message);
    }
 }

const blockTheUser=async (req,res)=>{
    try{
        const{id}=req.query
        const userUpdated=await Customer.updateOne({_id:id},{$set:{is_block:true}})
        if(userUpdated){
            return res.redirect('/admin/customers')
        }
    }catch (error){
        console.log(error.message);
    }
}


 const loadCategory=async (req,res)=>{
    try{
        const categories=await productCategory.find().sort({_id:-1})
        res.render("admin/productCategory",{categories})
    }catch(error){
        console.log(error.message);
    }
 }

 const loadAddCategory= async (req,res)=>{
    try{
        res.render('admin/addCategory',{message:''})
    }catch(error){
        console.log(error.message);
    }
 }

 const   addProductcategory = async (req, res) => {
    try {
        if (!req.body.categoryName || !req.file) {
            return res.render("admin/addCategory", { message: "Fill all fields..." });
        }

        const exist = await productCategory.findOne({ categoryName: req.body.categoryName });

        if (!exist) {
            const category = new productCategory({
                categoryName: req.body.categoryName,
                description: req.body.description,
                image: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            });

            await category.save();
            return res.redirect("/admin/product/Category-management");
        } else {
            return res.render('admin/addCategory', { message: "Category already exists" });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
    }
};

const deletecategory = async (req, res) => {
    try {
        console.log("Delete category function called");
        const { id } = req.params;
        console.log("Category ID:", id);

        const deleteCategory = await productCategory.findByIdAndDelete({ _id: id });
        console.log("Deleted Category:", deleteCategory);

        if (deleteCategory) {
            console.log("Category deleted successfully");
            res.redirect("/admin/product/Category-management");
        } else {
            console.log("Category not found");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const loadProductPage=async (req,res)=>{
    try{
        const products=await product.find()
        if(products){
            return res.render("admin/products",{products})
        }else{
           console.log("products not get");
        }
    }catch(error){
        console.log(error.message);
    }
}
const loadProductCreate= async (req,res)=>{
       try{
        const Categories= await productCategory.find()
        console.log(Categories);
        res.render("admin/addproduct",{message:"",Categories })
       }catch(error){
        console.log(error.message);
       }
}
const createProduct = async (req, res) => {
    console.log("HAI");
    console.log(req.body);
    const Categories = await productCategory.find()
    const { productName, brandName, price, description, stockCount, category,availability } = req.body;
    
    try {
        // Validate that required fields are provided
        if (!productName || !brandName) {
            return res.render('admin/addproduct', { message: "All fields are required. Please fill in all fields.", Categories});
        }
        let stock
        
        if (availability === 'true') {
            stock = true;
        } else {
            stock = false;
        }
       
        // Create the product
        const pro = new product({
            product_name: productName,
            brand_name: brandName,
            price: price,
            stock_count: stockCount,
            description:description,
            category: category,
            in_stock: stock,
        });

        // Assuming req.files is an array of uploaded image files
        req.files.forEach(file => {
            pro.image.push({ data: file.buffer, contentType: file.mimetype });
        });  console.log("here");
        await pro.save();
     console.log(pro);
    
        if (pro) {
            console.log(" added successfully.");
            return res.redirect("/admin/product")
        }

    } catch (error) {
        //    console.error(error);
        console.log(error.message);
        //    res.status(500).send("Error creating the product.");
    }
}
const productActivate= async (req, res) => {
    try {
        const id = req.params.id
        const change = await product.updateOne({ _id: id }, { $set: { is_delete: false } })
        if (change) {
            return res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const productDeactivate=async (req,res)=>{
    try{
        const id=req.params.id
        const change=await product.updateOne({_id:id},{$set:{is_delete:true}})
        if(change){
            return  res.redirect('/admin/product')
        }
    } catch(error){
        console.log(error.message);
    }
}

const loadProductEditPage =async(req,res)=>{
    try{
        const id=req.params.id
        const Product=await product.findOne({_id:id})
        const Categories=await productCategory.find({ categoryName: { $ne: Product.category } })
        res.render("admin/Edit",{message:"",Product,id,Categories})
    }catch(error){
        console.log(error.message);
    }
}

const editProduct=async(req,res)=>{
    const { productName, brandName, price, description, stockCount, category,id } = req.body;
    try{
        const productId=id;
        const data={
                    product_name:productName,
                    brand_name:brandName,
                    price:price,
                    stock_count:stockCount,
                    description:description,
                    category:category
                }
                
    const updatedProduct=await product.findByIdAndUpdate(productId,{$set:data},{new:true})
    await updatedProduct.save()
    res.redirect('/admin/product')
    }catch(error){
        console.log(error.message);
    }
}


module.exports={
    loadAdminLogin,loginValidation,adminValid,loadDash,displayCustomers,loadCategory,loadAddCategory,addProductcategory,deletecategory,loadProductPage,loadProductCreate,createProduct,productActivate,productDeactivate,UnblockTheUser,blockTheUser,loadProductEditPage,editProduct,adminLogout
}