const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require('cors');
// Mysql Connection 

const db = mysql.createConnection({
    host:"http://3.135.205.171",
    port:"3306",
    user:"root",
    password:"root",
    database:"stockmanager"
})

//Connect
db.connect((err)=>{
    if(err){
        throw err;
    }else{
        console.log("conncted");
    }

});


const app = express();
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors())


// Query 
app.get("/getData",(req,res)=>{
    let sql = "Select Product_Name,Product_Type,Quantity,Product_Color,Rack_Number,Plate_Number from stock";
    db.query(sql,(err,result)=>{
        if(err){
            throw err;
        }else{
            res.send(result)
        }
    });
})

app.post('/inbound', function (req, res) {
    const data = req.body;
    console.log(data)
    let quantity = 0;
    let new_quantity  = 0;
    for (const [key,value] of Object.entries(data)){
        let get_qty = `SELECT * from stock where ASIN = '${key}'`
        console.log(get_qty)
        
        db.query(get_qty,(err,result)=>{
            console.log('sre',result)
            if(err) throw err
            else{
                if (result.length == 0){
                    db.query(`Insert Into stock (ASIN , Quantity) values ('${key}',${value})`,(err,result)=>{
                        if(err){
                            throw err;
                        }else{
                         res.send("inserted NeW ASIN")
                            }
                    })
                }
                else if (result.length > 0){
                    quantity = result[0]["Quantity"]
                    new_quantity = quantity + value
                    console.log(new_quantity)        
                    db.query(`Update stock set Quantity = ${new_quantity} where ASIN = '${key}'`,(err,result)=>{
                        if(err){
                            throw err;
                        }else{
                           //res.send("Done")
                           console.log("done")
                        }
                        
                    })
                }
                
            }
            
        })
     
    
    }
    

});

app.post('/outbound', function (req, res) {
    const data = req.body;
    console.log(data)
    let quantity = 0;
    let new_quantity  = 0;
    for (const [key,value] of Object.entries(data)){
        let get_qty = `SELECT * from stock where ASIN = '${key}'`
        console.log(get_qty)
        
        db.query(get_qty,(err,result)=>{
            if(err) throw err
            else{
                if (result.length > 0){
                    quantity = result[0]["Quantity"]
                    new_quantity = quantity - value
                    console.log(new_quantity)        
                    db.query(`Update stock set Quantity = ${new_quantity} where ASIN = '${key}'`,(err,result)=>{
                        if(err) throw err 
                        console.log("Done")
                        
                    })
                }else{
                   res.send("Not FOUND")
                }
                
            }
            
        })
     
    
    }
    

});

app.post('/getProduct',(req,res)=>{
    console.log(req.body)

let query = `SELECT * FROM stock where ASIN = '${req.body[0]}' `;
db.query(query,(err,result)=>{
    if(err){
        throw err;
    }else{
        if(result.length > 0){
            res.send(result);
        }else{
            res.send(null)
        }
        
    }
})

});



app.listen("9000",()=>{
    console.log("Server Started on Port : 9000");
});