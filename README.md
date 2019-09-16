# MMC Web Code Challenge

This is a basic challenge to determine how you approach ambiguous challenges. Show us your creativity in interpreting these partial instructions to give us a working project!

## The Ask

You will need to make a small application that can search for recipes and save them to a list of favorites.

For this we'll use the free api at [Recipe Puppy](http://www.recipepuppy.com/). Documentation [can be found here.](http://www.recipepuppy.com/about/api/)

There are some basic mocks in `/mocks` -- showing the poor artistry of the random engineer assigned to the task.

 - Fork this project.
 - Complete the items below using any common front-end libraries only (jQuery, Lodash/Underscore).
 - Avoid front-end frameworks such as AngularJS and React, Vue, Knockout, Backbone, etc.
 - (( This must be entirely in the front end. Server side languages or platforms will be immediately disqualified ))
 - Commit this to your own git repository (any of the platforms) and send the link back. 

### What should it do?
 - Provide search functionality to query the api for recipes. 
    + [X] Search bar using comma separated text input
 - Show a list of recipes. Information should contain a thumbnail, recipe name, and number of ingredients.
    + [X] Done
 - Provide the functionality to add a recipe to my favorites.
    + [X] Done
 - Provide a way to get to a page showing all of my favorites.
    + [X] Done, link in navbar.
 - Favorites should persist between page views.
    + [X] Done, uses local storage.
 - Site should work on mobile devices.
    + [X] Working in chrome but not firefox on my android. Not exactly sure why and I can't seem to get
    debugging working with my desktop-phone connection so I can't see the error. I'm unfortunately leaving it like this for now.
 - Should have a very small code footprint.
    + [X] Not sure what qualifies as very small to be honest. I started this project by just writing the necessary functionality into one controller class, but then I decided to take it as an exercise in design to try to componentize my code to keep things organized (mostly, though I left the nav bar and page header as normal html to save some time).

#### Extra credit:
 - Add navigation that makes sense.
    + [X] Simple nav bar that goes between pages
 - Add the ability to remove favorites.
    + [X] Done
 - Create the ability to share my favorites with others.
