var express = require("express");
var app = express();
var cors = require("cors");
var mysql = require("mysql");
var multer = require("multer");
const path = require('path');



app.use(express.json())
app.use(cors());


const conn = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'instagramclone'
    }
);



app.post("/reg",(req, res)=>{

    const name = req.body.name;
    const surname = req.body.surname;
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;

     
    conn.query("INSERT INTO user(name, surname, email, username,  password) VALUES(?,?,?,?,?)", [
        name, surname, email, username, password
    ], (err, result) => {
        if(err)
            res.end("Failed");
        else{
            res.end("Success");
        }
    })

});

app.post("/comment",(req, res)=>{

    const user = req.body.user;
    const postid = req.body.post_id;
    const comment = req.body.comment;

    // res.end(user + postid + comment);
    

     
    conn.query("INSERT INTO comments(user,post_id,comment) VALUES(?,?,?)", [
        user, postid, comment
    ], (err, result) => {
        if(err)
            res.end(JSON.stringify(err));
        else{
            res.end("commented");
        }
    })

});


app.post("/getimages", (req, res) => {

    conn.query("SELECT * FROM posts WHERE user = ?", [req.body.user], (err, result)=>{

        if(err){
            console.log(err);
        }else{
            res.end(JSON.stringify(result));
        }

    });

}); 


app.post("/getstatus", (req, res) => {

    conn.query("SELECT * FROM status INNER JOIN user on status.user = user.username", [req.body.user], (err, result)=>{

        if(err){
            console.log(err);
        }else{
            res.end(JSON.stringify(result));
        }

    });

}); 

app.post("/fetchcomm", (req, res) => {

    conn.query("SELECT * FROM comments INNER JOIN user on comments.user = user.username WHERE post_id =? ", [req.body.postid], (err, result)=>{

        if(err){
            console.log(err);
        }else{
            res.end(JSON.stringify(result));
        }

    });

}); 

app.post("/search", (req, res) => {

    console.log(req.body.search);

    conn.query("SELECT * FROM user WHERE username = ?", [req.body.search], (err, result)=>{

        if(err){
            console.log(err);
        }else{
            // res.end(JSON.stringify(result));
           // console.log(JSON.stringify(result))
        }

    });

}); 

app.post("/usersstatus", (req, res) => {

    

    conn.query("SELECT * FROM statuses INNER JOIN user on statuses.user = user.username WHERE user = ?", [req.body.user], (err, result)=>{

        if(err){
            console.log(err);
        }else{
            
            res.end(JSON.stringify(result));
        }

    });

}); 


app.post("/login", (req, res)=>{

    const email = req.body.email;
    const pass = req.body.pass;

    conn.query("SELECT * FROM user WHERE email = ? and password = ? ", [email,pass], (err, result)=>{

            if(err){
                res.end("Failed");
            }else{
               
                if(result.length > 0){

                    res.end(JSON.stringify([result[0].username, result[0].profile_pic]));

                    console.log(JSON.stringify([result[0].username, result[0].profile_pic]));

                }else{

                    res.end("invalid");

                }

                

            }

    });

});



app.post("/like", (req, res)=>{

    const user = req.body.user;
    const post_id = req.body.post_id;

    var likes = 0;


    conn.query("SELECT * FROM posts WHERE id = ?", [post_id], (err, result)=>{

        if(err) throw err;
        else{

            likes = parseInt(result[0].likes);

            console.log(result);
        }

    });

    conn.query("SELECT * FROM likes WHERE user = ? AND post_id = ?", [user,post_id], (err, result)=>{

        if(err){
            res.end("Failed");

        }else{

            console.log(result);


            if(result.length < 1){

                conn.query("INSERT INTO likes(user,post_id)VALUE(?,?)", [user,post_id], (err, result)=>{

                    if(err){
                        res.end("Failed");
                    }else{
            
                        
        
                    }
        
                });


                conn.query("UPDATE posts SET likes = ? WHERE id = ?", [likes+1, post_id],
                (err, result)=>{

                    if(err){

                    }else{
                        res.end("liked");
                    }

                });

        }else{


            conn.query("DELETE FROM likes WHERE user = ? and post_id = ?", [user,post_id], (err, result)=>{

                if(err){
                    res.end("Failed");
                }else{
                   
                    
    
                }
    
            });

            conn.query("UPDATE posts SET likes = ? WHERE id = ?", [likes-1, post_id],
                (err, result)=>{

                    if(err){

                    }else{
                        res.end("disliked");
                    }

                });


        }
           
            

        }

    });

    

});

app.post("/fetch", (req, res)=>{

    const user = req.body.user;
  

    conn.query("SELECT * FROM posts INNER JOIN user on posts.user = user.username", [user], (err, result)=>{

            if(err){
                console.log(err);
                res.end("Failed");
            }else{

                // console.log(JSON.stringify(result));
               
                res.end(JSON.stringify(result));

            }

    });

});

app.post("/fetchuser", (req, res)=>{

    const user = req.body.user;
  

    conn.query("SELECT * FROM user WHERE username = ?", [user], (err, result)=>{

            if(err){
                console.log(err);
                res.end("Failed");
            }else{

                // console.log(JSON.stringify(result));
               
                res.end(JSON.stringify(result));

            }

    });

});

app.get("/fetchimg/:file", (req, res)=>{


    res.download("./images/"+req.params.file);

    
});


var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});



app.post("/upload", upload.single('file'), (req, res) => {
    if (!req.file) {
        console.log("No file upload");
    } else {

        const imgsrc = req.file.filename;
        const caption = req.body.caption;
        const user = req.body.user;

        var insertData = "INSERT INTO posts(user,caption,image)VALUES(?,?,?)"
        conn.query(insertData, [user,caption,imgsrc], (err, result) => {
            if (err) throw err
            res.end("uploaded");
        })
    }
});

app.post("/uploaddp", upload.single('file'), (req, res) => {
    if (!req.file) {
        console.log("No file upload");
    } else {

        const imgsrc = req.file.filename;
        const user = req.body.user;

        var insertData = "UPDATE user SET profile_pic = ? WHERE username = ? "
        conn.query(insertData, [imgsrc,user], (err, result) => {
            if (err) throw err
            res.end("uploaded");
        })
    }
});



app.post("/uploadstat", upload.single('file'), (req, res) => {
    if (!req.file) {
        console.log("No file upload");
    } else {

        const imgsrc = req.file.filename;
        const user = req.body.user;


        conn.query("SELECT * FROM status WHERE user = ? ", [user], (err, result)=>{


            if(result.length > 0){


                var update = "UPDATE status SET updated=?  WHERE user = ?";

                conn.query(update, ["true", user], (err, result)=>{

                    if(err) throw err
                    
                    else{

                        var insertData = "INSERT INTO statuses(user,image)VALUES(?,?)"
                        conn.query(insertData, [user,imgsrc], (err, result) => {
                            if (err) throw err
                            res.end("uploaded");
                        })


                    }


                });




            }else{


                var insertStat = "INSERT INTO status(updated,user) VALUES(?,?)";

                conn.query(insertStat, ["true", user], (err, result)=>{

                    if(err) throw err
                    
                    else{

                        var insertData = "INSERT INTO statuses(user,image)VALUES(?,?)"
                        conn.query(insertData, [user,imgsrc], (err, result) => {
                            if (err) throw err
                            res.end("uploaded");
                        })


                    }


                });



            }


        });


        

        
    }
});



app.listen(3001,()=>{
    console.log("Server is running")
});