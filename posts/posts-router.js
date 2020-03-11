const express = require("express");

const Posts = require("../data/db.js");

const router = express.Router();

//POST request to create a post
router.post("/", (req, res) => {

    const createdPost = req.body;

    if (!createdPost.title || !createdPost.contents) {
        res.status(400).json({
            errorMessage: "Please provide title and contents for the post."
        });
    }
    else {
        Posts.insert(req.body)
        .then(post => {
            console.log(post)

            let itemToAdd = {};

            //get the post object that was just created here to send back to the client
            Posts.findById(post.id) //post here returns the id as an obj created in the db for the new post created
            .then(response => {
              itemToAdd = response; //set item to add
              res.status(201).json(itemToAdd) //send itemToAdd to  client
            })
            .catch(error => {
                // log error to database
                console.log(error);
                res.status(500).json({
                    error: "The post information could not be retrieved. ",
                });
            });

        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                message: "There was an error while saving the post to the database. "
            })
        })
    }

})

//POST a comment to a post
router.post("/:id/comments", (req, res) => {
    const createdComment = req.body;
    let requestedPost = {};

    //see if you can find the post associated with this request
    Posts.findById(req.params.id)
    .then(post => {
        console.log(post)
        if (post.length === 0) {
            res.status(404).json({ message: "The post with the specified ID does not exist." });
        } else if (post) {
            requestedPost = post;
        }
    })
    .catch(error => {
        // log error to database
        console.log(error);
        res.status(500).json({
            error: "The post information could not be retrieved. ",
        });
    });


    //check if post was found, then that created comment is valid, and so on in order to post the comment to the db and return it to the client properly
    if (!requestedPost) {
        res.status(404).json({message: "The post with the specified ID does not exist. "})
    }
    else if (!createdComment.text) {
        res.status(400).json({errorMessage: "Please provide text for the comment. "})
    }
    else {
        
        Posts.insertComment(req.body)
        //console.log("when inserting comment", req.body)
            .then(commentId => {

                Posts.findCommentById(commentId.id)
                    .then(response => {
                        console.log(" comment created: ", response)
                        res.status(201).json(response); //response here is the found comment object with the same ID as the comment just created
                    })
                    .catch(error => {
                        // log error to database
                        console.log(error);
                        res.status(500).json({
                            error: "The comment information could not be retrieved. ",
                        });
                    })
                
            })
            .catch(error => {
                // log error to database
                console.log(error);
                res.status(500).json({
                    error: "There was an error while saving the comment to the database",
                });
            });
    }

  });


  //GET request to get all posts
  router.get("/", (req, res) => {
    Posts.find()
      .then(posts => {
        res.status(200).json(posts);
      })
      .catch(error => {
        // log error to database
        console.log(error);
        res.status(500).json({
          error: "The posts information could not be retrieved. ",
        });
      });
  });

  //GET request for get a post of a specific id
  router.get("/:id", (req, res) => {
    Posts.findById(req.params.id)
        .then(post => {
            console.log(post)
            if (post.length === 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            } else if (post) {
                res.status(200).json(post);
            }
        })
        .catch(error => {
            // log error to database
            console.log(error);
            res.status(500).json({
                error: "The post information could not be retrieved. ",
            });
        });
  });

  //GET request for a specific post's comments
  router.get("/:id/comments", (req, res) => {
    Posts.findPostComments(req.params.id)
      .then(post => {
        if (post.length === 0) {
            res.status(404).json({ message: "The post with the specified ID does not exist." });
    
        } else if (post) {
            res.status(200).json(post);
        }
      })
      .catch(error => {
        // log error to database
        console.log(error);
        res.status(500).json({
          error: "The comments information could not be retrieved. "
        });
      });
  });


  //DELETE request to delete a post by id
  router.delete("/:id", (req, res) => {

    let itemToDelete = {};

    Posts.findById(req.params.id)
        .then(post => {
            console.log(post)
            if (post.length === 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            } else if (post) {

                itemToDelete = post; //set post to delete

                Posts.remove(req.params.id)
                    .then(() => {
                        res.status(200).json(itemToDelete);
                    })
                    .catch(error => {
                        // log error to database
                        console.log(error);
                        res.status(500).json({
                            error: "The post could not be removed."
                        });
                    })
            }
        })
        .catch(error => {
            // log error to database
            console.log(error);
            res.status(500).json({
                error: "The post information could not be retrieved. ",
            });
        });
  });

  //PUT request to edit a post
  router.put("/:id", (req, res) => {
    const changes = req.body;

    if (!changes.title || !changes.contents) {
        res.status(400).json({
            errorMessage: "Please provide title and contents for the post. "
        })
    }
    else {
        Posts.update(req.params.id, changes)
        .then(response => {
          if (response) {
              let newPost = {};
              Posts.findById(req.params.id) 
                  .then(post => {
                      newPost = post; //set item to add
                      res.status(200).json(newPost) //send itemToAdd to  client
                  })
                  .catch(error => {
                      // log error to database
                      console.log(error);
                      res.status(500).json({
                          error: "The post information could not be retrieved. ",
                      });
                  });

          } else {
            res.status(404).json({ message: "The post with the specified ID does not exist."});
          }
        })
        .catch(error => {
          // log error to database
          console.log(error);
          res.status(500).json({
            error: "The post information could not be modified."
          });
        });
    }

  });
module.exports = router;