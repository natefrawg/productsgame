var Products = new Meteor.Collection("Products");
// {Name: "Row 1",  Inventory: 10, QuantityRemove: 7}
var Games = new Meteor.Collection("Games");
// {Name: "Game 1", Turn: "1", GameActive: true, GameOver: false}


var getCurrentEmail = function(){
  return Meteor.user() && Meteor.user().emails && Meteor.user().emails[0].address;
}

if (Meteor.isClient) {
  window.Products = Products;
  window.Games = Games;
  
  Games.insert({Name: "Game 1", Turn: 1, GameActive: false, GameOver: true});

  function playSound(filename){ 
    document.getElementById("sound").innerHTML='<audio autoplay><source src="' + filename + '"></audio>';
  }

  Template.Startgametemplate.events = {
    "click .createrowsbutton" : function ()
    {
      // Set up the Game
      while (Games.findOne({Name: "Game 1"}))
      {
        Games.remove({_id: Games.findOne({Name: "Game 1"})['_id']});  
      }
      Games.insert({Name: "Game 1", Turn: "1", GameActive: true, GameOver: false});

      // Clear the rows
      while (Products.findOne({Name: "Row 1"})) 
      {
        Products.remove({_id: Products.findOne({Name: "Row 1"})['_id']});
      }
      while (Products.findOne({Name: "Row 2"})) 
      {
        Products.remove({_id: Products.findOne({Name: "Row 2"})['_id']});
      }
      while (Products.findOne({Name: "Row 3"})) 
      {
        Products.remove({_id: Products.findOne({Name: "Row 3"})['_id']});
      }
      // Add new rows
      Products.insert({Name : "Row 1", Inventory: 10, QuantityRemove: 0});
      Products.insert({Name : "Row 2", Inventory: 8, QuantityRemove: 0});
      Products.insert({Name : "Row 3", Inventory: 6, QuantityRemove: 0});  

    }/*,
    "click .restartbutton" : function ()
    {
      Products.update({_id: Products.findOne({Name: "Row 1"})['_id']}, { $set : {Inventory: 10} });
      Products.update({_id: Products.findOne({Name: "Row 2"})['_id']}, { $set : {Inventory: 8} });
      Products.update({_id: Products.findOne({Name: "Row 3"})['_id']}, { $set : {Inventory: 6} });
    }*/
  };

  Template.Gametemplate.GetTurn = function()
  {
    var game1 = Games.findOne({Name: "Game 1"});
    if (game1.GameActive) {
      if (game1.GameOver) 
      {
        //playSound("assets/coin_deposit.wav");
        if(game1.Turn === "2") 
        {
          return "Game Over: Player 2 Lost";
        } else return "Game Over: Player 1 Lost";
      } else
      {
        if(game1.Turn === "2") 
        {
          playSound("assets/coin_deposit.wav");
          return "It's Player 2's Turn";
        } else 
        {
          playSound("assets/coin_deposit.wav");
          return "It's player 1's Turn";
        }
      };
    };
  };

  Template.Endgametemplate.GameOver = function()
  {
    var Items = Products.find({});
    var Sum = 0;

    Items.forEach(function(Item) 
    {
      Sum += Item.Inventory;
    });
    if(Sum === 1) 
    {
      Games.update({_id: Games.findOne({Name: "Game 1"})['_id']}, { $set : {GameOver: true} });
      //Session.set("GameOver", true);
      //return "The Game is Over";
    };
    var game1 = Games.findOne({Name: "Game 1"});
    if (game1.GameActive) 
    {
      if((Sum <= 0) && (!game1.GameOver))
      {
        if (game1.Turn === "1") {
          Games.update({_id: Games.findOne({Name: "Game 1"})['_id']}, { $set : {Turn: "2"} });
          Games.update({_id: Games.findOne({Name: "Game 1"})['_id']}, { $set : {GameOver: true} });
        } else 
        {
          Games.update({_id: Games.findOne({Name: "Game 1"})['_id']}, { $set : {Turn: "1"} });
          Games.update({_id: Games.findOne({Name: "Game 1"})['_id']}, { $set : {GameOver: true} });
        };
      };
    }
  };
       
  
/*
  Template.Productstemplate.start = function(){
    Products.insert({Name : "C", Price : 4.50, InStock : true, Inventory: 5});
    Products.insert({Name : "D", Price : 4.50, InStock : true, Inventory: 6});
  };
*/
  Template.Productstemplate.ProductArr = function(){
    if (Games.findOne({Name: "Game 1"})) {
      var game1 = Games.findOne({Name: "Game 1"});
      if (game1.GameActive) {
        return Products.find({}, {sort: {Name: 1, Inventory: 1}});
      };
    };
  };

  Template.Productstemplate.events = {
    // + symbol button
    "click input.plus" : function () {
      if(this.QuantityRemove < 7 && this.QuantityRemove < this.Inventory) 
      {
        Products.update({_id: this._id}, { $inc : {QuantityRemove : 1} });  
      } else alert("The max is 7, or whatever's remaining");
    },
    // - symbol button
    "click input.minus" : function () {
      if(this.QuantityRemove > 0)
      {
        Products.update({_id: this._id}, { $inc : {QuantityRemove : -1} });
      } else alert("Cannot remove negative cards");
    },
    "click input.submit" : function () 
    {      
      var game1 = Games.findOne({Name: "Game 1"});
      if ((!game1.GameOver) && (this.QuantityRemove > 0)) {  
        Products.update({_id: this._id}, { $inc : {Inventory : -this.QuantityRemove} });
        Products.update({_id: this._id}, { $inc : {QuantityRemove : -this.QuantityRemove} });   
        // Call Play Sound Function
        //playSound("assets/coin_deposit.wav");
        if  (game1.Turn === "2")
        {
          Games.update({_id: Games.findOne({Name: "Game 1"})['_id']}, { $set : {Turn: "1"} });
        } else Games.update({_id: Games.findOne({Name: "Game 1"})['_id']}, { $set : {Turn: "2"} });
      }
    }
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}
