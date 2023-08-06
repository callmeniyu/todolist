//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://getniyashere:shafisabira786@cluster0.9yhhwc6.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your todo list"
});

const item2 = new Item({
  name: "Hit + button to add a new item"
});

const item3 = new Item({
  name: "-- Hit this to delete an item"
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

  Item.find()
    .then(function (items) {
      if (items.length === 0) {
        Item.insertMany(defaultItem)
          .then(function () {
            console.log("Succesfully added");
          })
          .catch(function (err) {
            console.log(err)
          });

        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: items });
      }
    })
    .catch(function (err) {
      console.log(err)
    })
});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
    .then(function (doc) {
      doc.items.push(item);
      doc.save();
      res.redirect("/" + listName);
    })
    .catch(function (err) {
      console.log(err)
    })
  }
});


app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(function (doc) {

      if (!doc) {
        const list = new List({
          name: customListName,
          items: defaultItem
        })
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("List", { listTitle: customListName, newListItems: doc.items })
      }
    })
    .catch(function (err) {
      console.log(err)
    })
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    console.log("today")
    Item.findByIdAndDelete(checkedItemId)
    .then(function () {
      console.log("Succesfully deleted")
    })
    .catch(function (err) {
      console.log(err)
    })
  res.redirect("/");
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
      .then(function () {
        console.log("Succesfully deleted and updated")
        res.redirect("/"+listName)
      })
      .catch(function (err) {
      console.log(err)
    })
  }
  
})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
