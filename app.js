const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

////////////////////////////////////////
//const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
//const jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const Pool = require("mysql/lib/Pool");
const cors = require("cors");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");

//const app = express();
//const port = process.env.PORT || 7000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

//updated file

//MY SQL CODES HERE
//connection here
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "", //node2022
  database: "tingtongstoreDB",
  multipleStatements: true,
});

//////////////////////////////////////

//////////               1. Registration           /////////////

app.post("/user-registration", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);

        const {
          name,
          email,
          phone,
          userPhoto,
          deliveryAddress,
          billingAddress,
          password,
          media,
          mediaId,
          deviceId,
        } = req.body;

        const walletId = uuidv4();
        const hash = bcrypt.hashSync(password, 10);

        var sql =
          "INSERT INTO user_data (name,email,phone,userPhoto,deliveryAddress,billingAddress,password,walletId,media,mediaId,deviceId) VALUES(?,?,?,?,?,?,?,?,?,?,?);INSERT INTO wallet_data (walletId,walletBalance,currency) VALUES(?,?,?);SELECT userId,name,email,phone,userPhoto,deliveryAddress,billingAddress,walletId ,media,mediaId,deviceId,created_at  FROM user_data WHERE walletId=?";
        connection.query(
          sql,
          [
            name,
            email,
            phone,
            userPhoto,
            deliveryAddress,
            billingAddress,
            hash,
            walletId,
            media,
            mediaId,
            deviceId,
            walletId,
            0,
            "BDT",
            walletId,
          ],
          function (error, results, fields) {
            var objError = {
              RespCode: 300,
              RespMsg: "Error!",
              Message: "Email or Phone Already Used!",
            };
            if (error) {
              res.send(objError);
              res.end();
            } else {
              //var query_array=[]
              var query_array = results[2];
              var obj = {
                RespCode: 100,
                RespMsg: "Success",
                RespData: query_array[0],
              };
              // console.log(results[0]);
              // console.log(results[1]);
              res.send(obj);
              res.end();
            }
          }
        );

        connection.release();
        //console.log(req.body);
      });
    }
  });
});

////////////       2. user login         ///////////////

app.post("/user-login", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);

        const { email, phone, password } = req.body;

        var sql =
          "SELECT password from user_data WHERE email=? OR phone=?;SELECT userId,name,email,phone,userPhoto,deliveryAddress,billingAddress,walletId ,media,mediaId,deviceId,created_at FROM user_data WHERE email=? OR phone=?";
        connection.query(
          sql,
          [email, phone, email, phone],
          function (error, results, fields) {
            connection.release();

            const query_pass = results[0];
            if (query_pass[0] == undefined) {
              var foundpass = uuidv4();
            } else {
              var foundpass = query_pass[0].password;
            }
            //const query_user=results[1]
            //const userDetails=query_user[0]
            //console.log(userDetails);
            const userDetails = results[1];

            const isAuth = bcrypt.compareSync(password, foundpass); //comparing password with the hashed password
            if (isAuth) {
              var authorized = {
                RespCode: 100,
                RespMsg: "Success",
                RespData: userDetails[0],
              };
              res.send(authorized);
              res.end();
            } else {
              var unautorized = {
                RespCode: 404,
                RespMsg: "Please enter valid data",
              };
              res.send(unautorized);
              res.end();
            }
          }
        );

        //console.log(req.body);
      });
    }
  });
});

////////////        3. Get all category          ///////////////

app.post("/categorydata", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);

        connection.query("SELECT * from category_data", (err, rows) => {
          connection.release(); //return the connection to pool

          if (!err) {
            res.send(rows);
            res.end();
          } else {
            console.log(err);
          }
        });
      });
    }
  });
});

//////////////////// 4. Subcategory of each category //////////////////////

app.post("/category/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);

        connection.query(
          "SELECT * from subcategory_data WHERE categoryId=?",
          [req.params.id],
          (err, rows) => {
            connection.release(); //return the connection to pool

            if (!err) {
              res.send(rows);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
      });
    }
  });
});

////////////////// 5. Get All Subcategory  /////////////////////////////////

app.post("/subcategorydata", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);

        connection.query("SELECT * from subcategory_data", (err, rows) => {
          connection.release(); //return the connection to pool

          if (!err) {
            res.send(rows);
            res.end();
          } else {
            console.log(err);
          }
        });
      });
    }
  });
});

////////////////      6 . Get All Product         ///////////////////////

app.post("/productdata", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
        const data = req.body;
        const Id = data.userId;

        connection.query(
          `Select  
        pd.productId,
        pd.productName,
        pd.productImage,
        pd.productVideo,
        pd.productSize,
        pd.productColor,
        pd.brand,
        pd.regularPrice,
        pd.discountAmount,
        pd.discountPercentage,
        pd.discountedPrice,
        pd.deliveryCost,
        pd.categoryName,
        pd.subcategoryName,
        pd.rating,
        pd.vendorId,
        pd.subcategoryId,
        pd.categoryId,
        pd.quantity,
        pd.isFeatured,
        pd.isTopRated,
        pd.isNew,
        wl.ufpId,
        wl.userId ,
        coalesce(wl.isFav, 0) as isFav
        FROM product_data AS pd
        LEFT JOIN user_favorite_wishlist AS wl ON wl.productId = pd.productId
        AND wl.userId = ?
        `,
          [Id],
          (err, rows) => {
            connection.release(); //return the connection to pool

            if (!err) {
              res.send(rows);
            } else {
              console.log(err);
            }
          }
        );
      });
    }
  });
});

////////////////// 7. `Featured Products  ///////////////////

app.post("/featured-product-list", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);

        const data = req.body;
        const Id = data.userId;

        connection.query(
          `SELECT productId,productName ,productImage ,productVideo,productSize , productColor, 	brand ,regularPrice ,discountAmount ,discountPercentage,discountedPrice, 	deliveryCost,categoryName, 	subcategoryName,rating ,vendorId ,subcategoryId ,categoryId ,quantity ,isFeatured ,isTopRated ,isNew , ufpid,userId , COALESCE(isFav, 0) AS isFav
    
           FROM 
           ((SELECT * FROM product_data WHERE isFeatured=1) as a
           LEFT JOIN (SELECT ufpid,productId AS PID,userId , isFav FROM user_favorite_wishlist WHERE userId=?) as b
           ON a.productId = b.PID) ORDER BY productId `,
          [Id],
          (err, rows) => {
            connection.release(); //return the connection to pool

            if (!err) {
              //res.send(object)

              res.send(rows);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
      });
    }
  });
});

////////////////// 8. New Arrival Product /////////////////////////////

app.post("/new-arrival-product-list", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);

        const data = req.body;
        const Id = data.userId;

        connection.query(
          `SELECT productId,productName ,productImage ,productVideo,productSize , productColor, 	brand ,regularPrice ,discountAmount ,discountPercentage,discountedPrice, 	deliveryCost,categoryName, 	subcategoryName,rating ,vendorId ,subcategoryId ,categoryId ,quantity ,isFeatured ,isTopRated ,isNew , ufpid,userId , COALESCE(isFav, 0) AS isFav
    
           FROM 
           ((SELECT * FROM product_data WHERE isNew=1 ) as a
           LEFT JOIN (SELECT ufpid,productId AS PID,userId , isFav FROM user_favorite_wishlist WHERE userId=?) as b
           ON a.productId = b.PID) ORDER BY productId `,
          [Id],
          (err, rows) => {
            connection.release(); //return the connection to pool

            if (!err) {
              //res.send(object)

              res.send(rows);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
      });
    }
  });
});

//****************9. top-rated-product-list************************//

app.post("/top-rated-product-list", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);

        const data = req.body;
        const Id = data.userId;

        connection.query(
          `SELECT productId,productName ,productImage ,productVideo,productSize , productColor, 	brand ,regularPrice ,discountAmount ,discountPercentage,discountedPrice, 	deliveryCost,categoryName, 	subcategoryName,rating ,vendorId ,subcategoryId ,categoryId ,quantity ,isFeatured ,isTopRated ,isNew , ufpid,userId , COALESCE(isFav, 0) AS isFav
  
         FROM 
         ((SELECT * FROM product_data WHERE isTopRated=1 ) as a
         LEFT JOIN (SELECT ufpid,productId AS PID,userId , isFav FROM user_favorite_wishlist WHERE userId=?) as b
         ON a.productId = b.PID) ORDER BY productId `,
          [Id],
          (err, rows) => {
            connection.release(); //return the connection to pool

            if (!err) {
              //res.send(object)

              res.send(rows);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
      });
    }
  });
});

/***********************10. Top Selling Product List***************************************/

app.post("/top-selling-product-list", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);

        const data = req.body;
        const Id = data.userId;

        connection.query(
          `SELECT productId,productName ,productImage ,productVideo,productSize , productColor, 	brand ,regularPrice ,discountAmount ,discountPercentage,discountedPrice, 	deliveryCost,categoryName, 	subcategoryName,rating ,vendorId ,subcategoryId ,categoryId ,quantity ,isFeatured ,isTopRated ,isNew , ufpid,userId , COALESCE(isFav, 0) AS isFav
    
           FROM 
           ((SELECT * FROM product_data WHERE isTopRated=1 ) as a
           LEFT JOIN (SELECT ufpid,productId AS PID,userId , isFav FROM user_favorite_wishlist WHERE userId=?) as b
           ON a.productId = b.PID) ORDER BY productId `,
          [Id],
          (err, rows) => {
            connection.release(); //return the connection to pool

            if (!err) {
              //res.send(object)

              res.send(rows);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
      });
    }
  });
});

/***********************11. Discounted Product List***************************************/

app.post("/discounted-product-list", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);

        const data = req.body;
        const Id = data.userId;

        connection.query(
          `SELECT productId,productName ,productImage ,productVideo,productSize , productColor, 	brand ,regularPrice ,discountAmount ,discountPercentage,discountedPrice, 	deliveryCost,categoryName, 	subcategoryName,rating ,vendorId ,subcategoryId ,categoryId ,quantity ,isFeatured ,isTopRated ,isNew , ufpid,userId , COALESCE(isFav, 0) AS isFav

       FROM 
       ((SELECT * FROM product_data WHERE discountPercentage>0 OR discountAmount>0 ) as a
       LEFT JOIN (SELECT ufpid,productId AS PID,userId , isFav FROM user_favorite_wishlist WHERE userId=?) as b
       ON a.productId = b.PID) ORDER BY productId `,
          [Id],
          (err, rows) => {
            connection.release(); //return the connection to pool

            if (!err) {
              //res.send(object)

              res.send(rows);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
      });
    }
  });
});

/******************12. Category,Sub Category with Products****************************************/

//three tables product_data category_data subcategory_data

app.post("/category/:catId/:subcatId", verifyToken, (req, res) => {
  
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
        const categoryId = req.params.catId;
        const subcategoryId = req.params.subcatId;
        const { userId } = req.body;

        connection.query(
          `SELECT productId,productName ,productImage ,productVideo,productSize , productColor, 	brand ,regularPrice ,discountAmount ,discountPercentage,discountedPrice, 	deliveryCost,categoryName, 	subcategoryName,rating ,vendorId ,subcategoryId ,categoryId ,quantity ,isFeatured ,isTopRated ,isNew , ufpid,userId , COALESCE(isFav, 0) AS isFav
       FROM 
       ((SELECT * FROM product_data WHERE categoryId=? AND subcategoryId=? ) as a
       LEFT JOIN (SELECT ufpid,productId AS PID,userId , isFav FROM user_favorite_wishlist WHERE userId=?) as b
       ON a.productId = b.PID) ORDER BY productId
      `,
          [categoryId, subcategoryId, userId],
          (err, rows) => {
            connection.release(); //return the connection to pool

            if (!err) {
              res.send(rows);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
      });
    }
  });
});

/**********************13. ADD FAVORITE PRODUCT***********************************************/

app.post("/add-favorite-products/1", verifyToken, (req, res) => {

  jwt.verify(req.token, 'tingtong', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {

      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
    
        const {     
          productId,
          userId,
    
          
        } = req.body;
        
       
       
    
        connection.query(
          `INSERT INTO user_favorite_wishlist  (productId,userId) VALUES(?,?)`,[productId,userId],
          
          (err, rows) => {
            connection.release();
            var obj={
              RespCode:100,
              RespMsg:"Success"
            }
            if (!err) {
              res.send(obj);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
    
        console.log(req.body);
      });
  
    }
  });


});

/**********************14 DELETE FAVORITE PRODUCT***********************************************/

app.post("/add-favorite-products/0", verifyToken, (req, res) => {

  jwt.verify(req.token, 'tingtong', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
    
        const {     
          productId,
          userId
    
          
        } = req.body;
        
        
        connection.query(
          `DELETE FROM user_favorite_wishlist  WHERE productId=? AND userId=?`,[productId,userId],
          
          (err, rows) => {
            connection.release();
            var obj={
              RespCode:100,
              RespMsg:"Deleted Successfully!"
            }
            if (!err) {
              res.send(obj);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
    
        console.log(req.body);
      });
    }
  });

});

/*********************************15. Get Favorite Products******************************************/

//get favourite product of an id 

app.post("/favorite-products", verifyToken, (req, res) => {

  jwt.verify(req.token, 'tingtong', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
        const data=req.body
        const Id=data.userId
    
        
    
        connection.query("SELECT * FROM product_data INNER JOIN user_favorite_wishlist ON product_data.productId=user_favorite_wishlist.productId WHERE user_favorite_wishlist.userId=? ",[Id], (err, rows) => {
          connection.release(); //return the connection to pool
    
          if (!err) {
            res.send(rows);
          } else {
            console.log(err);
          }
        });
      });
    }
  });

});

/**********************16. ADD TO CART***********************************************/

app.post("/add-to-cart", verifyToken, (req, res) => {

  jwt.verify(req.token, 'tingtong', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
    
        const {     
          productId,
          userId,
          quantity
    
          
        } = req.body;
        
       
       
    
        connection.query(
          `INSERT INTO user_cart_data (productId,userId,quantity) VALUES(?,?,?)`,[productId,userId,quantity],
          
          (err, rows) => {
            connection.release();
            var obj={
              RespCode:100,
              RespMsg:"Successfully Added!"
            }
            if (!err) {
              res.send(obj);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
    
        console.log(req.body);
      });
    }
  });


});

/**********************17. DELETE FROM CART***********************************************/

app.post("/delete-from-cart", verifyToken, (req, res) => {

  jwt.verify(req.token, 'tingtong', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
    
        const {     
          productId,
          userId
        
    
    
          
        } = req.body;
        
       
       
    
        connection.query(
          `DELETE FROM user_cart_data  WHERE productId=? AND userId=?`,[productId,userId],
          
          (err, rows) => {
            connection.release();
            var obj={
              RespCode:100,
              RespMsg:"Deleted Successfully!"
            }
            if (!err) {
              res.send(obj);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
    
        console.log(req.body);
      });
    }
  });

});

/**********************18. CHECK USER'S CART Data***********************************************/


app.post("/user-cart", verifyToken, (req, res) => {

  
  jwt.verify(req.token, 'tingtong', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {

      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
        const data=req.body;
        const id=data.userId;
    
        connection.query(
          "SELECT pd.productId,pd.productName,pd.productImage,pd.productVideo,pd.productSize,pd.productColor,pd.brand,pd.regularPrice,pd.discountAmount,pd.discountPercentage,pd.discountedPrice,pd.deliveryCost,pd.categoryName,pd.subcategoryName,pd.rating,pd.vendorId,pd.subcategoryId,pd.categoryId,pd.quantity AS stock,pd.isFeatured,pd.isTopRated,pd.isNew,c.cartId,c.quantity,c.userId FROM product_data AS pd INNER JOIN user_cart_data AS c ON pd.productId=c.productId WHERE c.userId=?",
          [id],
          (err, rows) => {
            connection.release(); //return the connection to pool
    
            if (!err) {
              res.send(rows);
              res.end();
            } else {
              console.log(err);
            }
          }
        );
      });
  
    }
  });

});

/*******************************19. UPDATE USER PROFILE*********************************************/

app.post("/update-user-profile", verifyToken, (req, res) => {

  jwt.verify(req.token, 'tingtong', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
    
        const {
            userId,
            name , 
            userPhoto ,	
            deliveryAddress ,	
            billingAddress
          
            
        } = req.body;
    
        var sql = "UPDATE user_data SET name=?,userPhoto=?,deliveryAddress=?,billingAddress=? WHERE userId=?;SELECT userId,name,email,phone,userPhoto,deliveryAddress,billingAddress,walletId ,media,mediaId,deviceId,created_at FROM user_data WHERE userId=?";
        connection.query(sql, [name,userPhoto,deliveryAddress,billingAddress,userId,userId], function(error, results, fields) {
          
    
          if (error) {
            res.send(error)
            res.end()
          }else{
            //var query_array=[]
            var query_array=results[1]
            var obj={
              RespCode:100,
              RespMsg:"Updated Successfully!",
              RespData:query_array[0]
            }
            // console.log(results[0]);
            // console.log(results[1]);
            res.send(obj)
            res.end()
            
          }
         
      });
       
      connection.release();
        //console.log(req.body);
      });
    }
  });

 
});

/****************************20. SEARCH PRODUCT BY KEYWORD**********************************/

   
app.post("/search-products", verifyToken,  (req, res) => {

  
  jwt.verify(req.token, 'tingtong', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
        const {
          userId,
         keyWord
              } = req.body;
              
        connection.query(`SELECT productId,productName ,productImage ,productVideo,productSize , productColor, 	brand ,regularPrice ,discountAmount ,discountPercentage,discountedPrice, 	deliveryCost,categoryName, 	subcategoryName,rating ,vendorId ,subcategoryId ,categoryId ,quantity ,isFeatured ,isTopRated ,isNew , ufpid,userId , COALESCE(isFav, 0) AS isFav
        FROM 
        ((SELECT * from product_data WHERE productName LIKE '%${keyWord}%' ) as a
        LEFT JOIN (SELECT ufpid,productId AS PID,userId , isFav FROM user_favorite_wishlist WHERE userId=?) as b
        ON a.productId = b.PID) ORDER BY productId
        `,[userId], (err, rows) => {
          connection.release(); //return the connection to pool
    
          if (!err) {
            res.send(rows);
          } else {
            console.log(err);
          }
        });
      });
    }
  });

  

}); 

   
//****************************************21. Product Details**********************************************/

app.post("/productdetails", verifyToken, (req, res) => {


  jwt.verify(req.token, 'tingtong', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {

      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connection as id  ${connection.threadId}`);
        const {productId}=req.body
        var sql="SELECT * from product_data WHERE productId=?;SELECT * FROM product_data WHERE subcategoryId IN (SELECT DISTINCT subcategoryId FROM product_data WHERE productId =?);SELECT * from product_review WHERE productId =? LIMIT 5;SELECT AVG(rating) as userRating,COUNT(reviewId) as totalReviews from product_review WHERE productId=?;SELECT vendorName,shopImageUrl,totalProducts FROM vendor_data WHERE vendorId IN (SELECT DISTINCT vendorId FROM product_data WHERE productId =?)";
        connection.query(sql,
          [productId,productId,productId,productId,productId],
          (err, results) => {
            connection.release(); //return the connection to pool
            var productDetailsList=results[0];
            var productDetails=productDetailsList[0];
            var recommendedProducts=results[1];
            var productReviewLimit=results[2];
            var productRatingList=results[3];
            var vendorDataList = results[4];
            var vendorData=vendorDataList[0];
            var productRatingObject=productRatingList[0];
            var productRating=productRatingObject.userRating;
            var totalReviews=productRatingObject.totalReviews;
            
            console.log(productRating)
            if (!err) {
              var obj={
                RespCode:100,
                RespMsg:"Success",
                productDetails:productDetails,
                recommendedProducts:recommendedProducts,
                productReviews:productReviewLimit,
                productRating:productRating,
                totalReviews:totalReviews,
                vendorData:vendorData
    
              }
              res.send(obj);
            } else {
              console.log(err);
            }
          }
        );
      });
  
    }
  });
  


});

  


////////////     Getting token     ////////////////
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the API",
  });
});

app.post("/api/posts", verifyToken, (req, res) => {
  jwt.verify(req.token, "tingtong", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: "Post created...",
        authData,
      });
    }
  });
});

app.post("/api/login", (req, res) => {
  // Mock user
  const user = {
    username: "naim",
  };

  jwt.sign({}, "tingtong", { expiresIn: "365d" }, (err, token) => {
    res.json({
      token,
    });
  });
});


////////////Token End/////////////////////////////

/***********************************************Use login****************************/


// app.post("/user-login", verifyToken, (req, res) => {

//   const user = {
//     username:"naim"
//   }

//   var getToken="";

//   jwt.sign({user}, 'tingtong', { expiresIn: '10m' }, (err, token) => {
//     getToken=token
//   });
// jwt.verify(req.getToken, 'tingtong', (err, authData) => {
//   if(err) {
//     res.sendStatus(403);
//   } else {
//     pool.getConnection((err, connection) => {
//       if (err) throw err;
//       console.log(`connection as id  ${connection.threadId}`);

//       const {
//         email,
//         phone,
//         password

//       } = req.body;

//      var sql="SELECT password from user_data WHERE email=? OR phone=?;SELECT userId,name,email,phone,userPhoto,deliveryAddress,billingAddress,walletId ,media,mediaId,deviceId,created_at FROM user_data WHERE email=? OR phone=?"
//       connection.query(
//         sql,[email,phone,email,phone],
//         function(error, results, fields){
//           connection.release();

//           const query_pass=results[0]
//           if(query_pass[0]==undefined){
//             var foundpass=uuidv4()
//           }else{
//             var foundpass=query_pass[0].password
//           }
//           //const query_user=results[1]
//           //const userDetails=query_user[0]
//           //console.log(userDetails);
//           const userDetails=results[1]

//           const isAuth=bcrypt.compareSync(password, foundpass) //comparing password with the hashed password
//           if(isAuth){

//               var authorized={
//                 RespCode: 100,
//                 RespMsg: "Success",
//                 RespData:userDetails[0]
//               }
//               res.send(authorized);
//               res.end()

//           }else{

//             var unautorized={
//               RespCode:404,
//               RespMsg:"Please enter valid data"
//             }
//               res.send(unautorized);
//               res.end()
//           }
//         }
//       );

//       //console.log(req.body);
//     });
//   }
// });

// });

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}

app.listen(5000, () => console.log("Server started on port 5000"));

// jwt.verify(req.token, 'tingtong', (err, authData) => {
//   if(err) {
//     res.sendStatus(403);
//   } else {

//   }
// });
