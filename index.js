class SearchPage {
  // Pages are controllers for each page. They generate the page from components and hold some state.
  // They are mounted to the element passed into the constructor.
  constructor(element) {
    this.element = element;

    // Setup favorites. Favorites array for long-term storage, favorites set to quickly check whether recipe is in favorites or not.
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let hrefs = favorites.map((favorite) => {
      return favorite.href;
    })

    this.favoritesSet = new Set(hrefs);
    this.favoritesArr = favorites;
    
    this.setup();
  }

  setup() {
    this.infiniteScroll = null; // in place of pagination because api doesn't return total count of items

    // Create and mount components
    this.component = {};
    this.component.searchComponent = new SearchComponent({
      pageController: this,
    });
    this.component.recipesContainer = new RecipesContainerComponent({ pageController: this });

    this.component.searchComponent.mount(this.element);
    this.component.recipesContainer.mount(this.element);

    // Highlight the navbar link. Navbar could be componentized, I just wanted to save myself some time.
    document.querySelectorAll('.navbar-link').forEach((el) => {
      el.classList.remove('active-page');
      if (el.id === "navbar-home") {
        el.classList.add('active-page');
      }
    })

    // Setup search handler
    this.component.searchComponent.setSearchHandler(this.showFirstPage);
  }

  teardown() {
    for (let el in this.component) {
      this.component[el].destroy();
    }

    clearInterval(this.infiniteScroll);
    this.element.innerHTML = '';
  }

  showFirstPage = (event) => {
    event.preventDefault();

    // clear results
    this.component.recipesContainer.clear();
    this.component.searchComponent.page = 1;

    // set up infinite scroll
    clearTimeout(this.infiniteScroll);
    this.infiniteScroll = setInterval(this.scrollHandler(), 250);   

    let response = this.component.searchComponent.getFirstPage();
    response.then((json) => {
      this.component.recipesContainer.addRecipes(json.results);
    }).catch((err) => {
      console.log(err);
    });

  }

  showMore() {

  }

  scrollHandler = () => {
    let loading = false;

    return () => {
      let distanceFromBottom = $(document).height() - ($(window).scrollTop() + $(window).height());

      if (distanceFromBottom <= 450 && !loading) {
        loading = true;
        let response = this.component.searchComponent.loadNextPage();
        response.then((json) => {
          setTimeout(() => { loading = false; }, 500); // give recipescontainer time to render.
          this.component.recipesContainer.addRecipes(json.results);
        }).catch((err) => {
          setTimeout(() => { loading = false; }, 500);
          console.log(err);
        });
      } else {
        // pass
      }
    }
  }

  saveFavorites = () => {
    localStorage.setItem('favorites', JSON.stringify(this.favoritesArr || []));    
  }

  addToFavorites = (recipe) => {
    // our simple implementation of favorites is to store an array of favorites as a JSON string in local storage.
    // we load this value into an actual array and keep it updated as the user browses the page.
    this.favoritesArr.push({
      href: recipe.href,
      thumbnail: recipe.thumbnail,
      ingredients: recipe.ingredients,
      title: recipe.title,
    });

    this.favoritesSet.add(recipe.href);
    this.saveFavorites();
  } 

  removeFromFavorites = (recipe) => {
    this.favoritesArr = this.favoritesArr.filter((favorite) => {
      return favorite.href !== recipe.href;
    });

    this.favoritesSet.delete(recipe.href);
    this.saveFavorites();
  }
}

class FavoritesPage extends SearchPage {
  /* Favorites page is essentially a stripped-down version of the search page. We use it as a base class and 
  use the setup() method to do setup specific to each type of page. */
  constructor(element) {
    super(element);
  }

  setup() {
    // Create and mount components
    this.component = {};
    this.component.recipesContainer = new RecipesContainerComponent({ pageController: this });

    this.component.recipesContainer.mount(this.element);

    // Highlight the navbar link.
    document.querySelectorAll('.navbar-link').forEach((el) => {
      el.classList.remove('active-page');
      if (el.id === "navbar-favorites") {
        el.classList.add('active-page');
      }
    })

    this.renderFavorites();
  }

  renderFavorites() {
    this.component.recipesContainer.addRecipes(this.favoritesArr);
  }
}

class AboutPage {
  constructor(element) {
    this.element = element;
    this.setup();
  }

  setup() {
    // Would create and mount some components here but this is just an example page so I'll just add some text.
    this.component = {};
    this.component.header = document.createElement('div');
    this.component.header.innerText = 'This is a placeholder for the about page.';
    this.element.appendChild(this.component.header);
    
    // Highlight the navbar link.
    document.querySelectorAll('.navbar-link').forEach((el) => {
      el.classList.remove('active-page');
      if (el.id === "navbar-about") {
        el.classList.add('active-page');
      }
    })
  }

  teardown() {
    this.element.innerHTML = '';
  }
}

class SearchComponent {  
  /* Search component - provides a method to make a fetch request to the RecipePuppy api and returns results */
  constructor(data) {
    Object.assign(this, data);
    this.page = 1;
    this.querystring = '';
    this.component = this.createComponent();
  }

  createComponent = () => {
    let component = document.createElement('form');
    component.id = 'search-form';
    let searchInput = document.createElement('input');
    searchInput.id = "search-input";
    searchInput.placeholder = "Ex: +eggs,-onions,flour,sugar";
    searchInput.type = "text";
    searchInput.name = "search-input";
    let submit = document.createElement('button');
    submit.type = "submit";
    submit.innerText = 'Search';
    
    component.searchInput = searchInput;
    component.appendChild(searchInput);
    component.appendChild(submit);

    return component;
  }

  setSearchHandler(func) {
    this.component.addEventListener('submit', func);
  }

  getFirstPage = () => {
    /* Validates and runs search string to fetch first page of results*/
    this.querystring = this.component.searchInput.value;
    this.querystring = this.sanitizeInput(this.querystring);

    return fetch(`https://cors-anywhere.herokuapp.com/http://www.recipepuppy.com/api/?i=${encodeURIComponent(this.querystring)}&p=${this.page}`).then((response) => {
      return response.json(); // Recipe api doesn't appear to allow CORS requests
    }).then((json) => {
      return json;
    }).catch((err) => {
      console.log(err);
    });
  }

  loadNextPage() {
    /* Uses existing search string and fetches the next page */
    this.page = this.page + 1;
    return fetch(`https://cors-anywhere.herokuapp.com/http://www.recipepuppy.com/api/?i=${encodeURIComponent(this.querystring)}&p=${this.page}`).then((response) => {
      return response.json(); // Recipe api doesn't appear to allow CORS requests
    }).then((json) => {
      return json;
    }).catch((err) => {
      console.log(err);
    });
  }

  sanitizeInput(str) {
    /* Removes leading / trailing whitespace and non alphabetical characters. */
    let invalidChars = /[^a-zA-Z-+,]/g;
    return str.trim().replace(invalidChars, '').trim();
  }

  mount(el) {
    el.appendChild(this.component)
  }

  destroy() {
    this.component.innerHTML = '';
  }
}

class RecipesContainerComponent {
  /* Main display component. Takes arrays of recipe objects via the 'addRecipes' method
  and displays them as recipe components. */
  constructor(data) {
    Object.assign(this, data);
    this.recipes = [];
    this.component = this.createComponent();
  }

  createComponent = () => {
    let component = document.createElement('div');
    component.id = 'recipes-container';

    return component;
  }

  clear() {
    this.recipes = [];
    this.component.innerHTML = '';
  }

  addRecipes(recipes) {
    this.recipes = this.recipes.concat(recipes);
    this.renderRecipes();
  }

  renderRecipes() {
    this.component.innerHTML = '';

    if (this.recipes.length === 0) {
      clearTimeout(this.pageController.infiniteScroll);
      this.component.innerHTML = 'No recipes found';
    }

    let recipeComponents = this.recipes.map((data) => {
      return new RecipeComponent({ pageController: this.pageController, ...data });
    })

    recipeComponents.forEach((recipeComponent) => {
      recipeComponent.mount(this.component);
    });
  }

  mount(el) {
    el.appendChild(this.component)
  }

  destroy() {
    this.component.innerHTML = '';
  }
}

class RecipeComponent {
  /* Recipe component displays each of the individual recipes based on an object passed to its constructor, as well
  as allows users to favorite / unfavorite. */
  constructor(data) {
    Object.assign(this, data);
    this.thumbnail = this.thumbnail === '' ? './images/default-food.png' : this.thumbnail;
    this.title = this.title.trim();
    this.component = this.createComponent();
  }

  createComponent = () => {
    let component = document.createElement('div');
    let imgContainer = document.createElement('a');
    let img = document.createElement('img');
    let titleContainer = document.createElement('a');
    let favoriteButton = document.createElement('i');
    let description = document.createElement('div');
    description.innerText = `${this.ingredients.split(',').length} ingredients`; // api response doesn't seem to include all ingredients, so this number will appear off
    imgContainer.href = this.href;
    imgContainer.target = "_blank";
    titleContainer.href = this.href;
    titleContainer.target = "_blank";
    img.src = this.thumbnail;
    titleContainer.innerText = this.title;
    favoriteButton.className = this.isFavorited() ? "fas fa-heart fav-button" : "far fa-heart fav-button";
    imgContainer.appendChild(img);
    imgContainer.appendChild(favoriteButton);
    component.appendChild(imgContainer);
    component.appendChild(titleContainer);
    component.appendChild(description);
    component.className = 'recipe';
    component.favoriteButton = favoriteButton;
    favoriteButton.addEventListener('click', this.handleFavorite);
    return component;
  }

  handleFavorite = (event) => {
    event.preventDefault();

    if (this.isFavorited()) {
      this.pageController.removeFromFavorites(this);
      this.component.favoriteButton.className = "far fa-heart fav-button";
    } else {
      this.pageController.addToFavorites(this);
      this.component.favoriteButton.className = "fas fa-heart fav-button";
    }
  }

  isFavorited() {
    return this.pageController.favoritesSet.has(this.href);
  }

  mount(el) {
    el.appendChild(this.component)
  }

  destroy() {
    this.component.innerHTML = '';
  }
}

class Router {
  constructor() {
    this.currentPage = null;
    this.element = document.querySelector('#router-view');
  }

  home() {
    this.currentPage = new SearchPage(this.element);
  }

  about() {
    this.currentPage = new AboutPage(this.element);
  }

  favorites() {
    this.currentPage = new FavoritesPage(this.element);
  }

  route(path) {
    if (this.currentPage !== null) {
      this.currentPage.teardown();
    }

    this[path]();
  }
}

class App {
  constructor() {
    this.router = new Router();
    this.setup();
  }

  setup() {
    this.router.route('home');
    document.querySelector('#navbar-home').addEventListener('click', () => this.router.route('home'));
    document.querySelector('#navbar-favorites').addEventListener('click', () => this.router.route('favorites'));
    document.querySelector('#navbar-about').addEventListener('click', () => this.router.route('about'))
  }  
}

let app;

window.onload = () => { 
  console.log('app created');
  app = new App() 
};