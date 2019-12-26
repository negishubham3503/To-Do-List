//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shubham:SNssgk@3503@cluster0-69f65.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to-do-list"
});
const item2 = new Item({
  name: "Hit + to add new items"
});
const item3 = new Item({
  name: "Check the boxes to delete"
});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (err)
      console.log(err);
    else{
      if (foundItems.length === 0){
        Item.insertMany([item1, item2, item3], function(err){
        if (err)
          console.log(err);
        else
          console.log("Successfully inserted");
        });
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, customList){
      if (err)
        console.log(err);
      else{
        customList.items.push(item);
        customList.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", function(req, res){
  const val = req.body.checkbox;
  const listName = req.body.checkedList;

  if (listName === "Today"){
    Item.findByIdAndRemove(val, function(err){
      if (err)
        console.log(err);
      else{
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: val}}}, function(err){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:listName", function(req, res){
  const listName = _.capitalize(req.params.listName);
  List.findOne({name: listName}, function(err, foundList){
    if(err)
      console.log(err);
    else{
      if (!foundList){
        const list = new List({
          name: listName,
          items: [item1, item2, item3]
        });
        list.save();
        res.redirect("/" + listName);
      }
      else  
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
