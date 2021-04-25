const jokesWrapper = document.querySelector('.jokes__wrapper'),
  jokesWrapperFavourite = document.querySelector('.jokes__favourite');

class Form {
  constructor(el) {
    this.el = el;
    this.categories = el.querySelector('input[name="joke__type"][value="categories"]');
    this.categoriesName = [];

    // this.el.addEventListener('submit',(e)=>{
    // 	e.preventDefault();
    // 	this.formSubmit();
    // });

    this.el.addEventListener('submit', this.formSubmit.bind(this));
    this.categories.addEventListener('change', this.getCategories.bind(this));
  }

  async formSubmit(e) {

    e.preventDefault();

    let form = this.el;

    let jokeType = form.querySelector('input[name="joke__type"]:checked'),
      jokeTypeValue = jokeType.value;

    let url;

    switch (jokeTypeValue) {
      case 'random':
        url = `https://api.chucknorris.io/jokes/random`;
        break;
      case 'categories':
        let selectedCategory = document.querySelector('input[name="joke__category"]:checked');

        if (!selectedCategory) {
          selectedCategory = document.querySelector('.categories label:first-of-type input[name="joke__category"]');
        }

        let selectedCategoryValue = selectedCategory.value;
        url = `https://api.chucknorris.io/jokes/random?category=${selectedCategoryValue}`;
        break;
      case 'search':
        let searchInput = document.querySelector('#searchInput'),
          searchInputValue = searchInput.value ? searchInput.value : `hello`;
        url = `https://api.chucknorris.io/jokes/search?query=${searchInputValue}`;
        break;
    }

    let joke = new Joke(await this.getJoke(url));
    joke.renderJoke();
  }

  async getJoke(url) {
    let response = await fetch(url),
      data = await response.json();
    return data;
  }

  async getCategories() {
    if (!this.categoriesName.length) {
      let categories = await this.getJoke(`https://api.chucknorris.io/jokes/categories`);
      this.renderCategories(categories);
      this.categoriesName = categories;
    }
  }

  renderCategories(categories) {
    let renderedCategories = categories
      .map(category => {
        return `<label>
												${category} <input type="radio" value="${category}" name="joke__category">
											</label>`;
      })
      .join('');

    let categoriesContainer = document.querySelector('.categories');
    categoriesContainer.innerHTML = renderedCategories;
  }

}

class Joke {
  constructor(data, favourite = false) {
    this.data = data;
    this.favourite = favourite;
  }

  renderJoke() {
    let joke = this.data;
    if (joke.result && joke.result.length > 0) {
      joke.result.forEach(joke => {
        let newJoke = new Joke(joke);
        newJoke.renderJoke();
      });
    } else {
      console.log(joke);

      let jokeBlock = document.createElement('div');
      jokeBlock.classList.add('joke');

      let btnFav = document.createElement('button');
      btnFav.innerHTML = joke.favourite ? 'Remove from favourite' : 'Add to favourite';
      btnFav.id = joke.id;

      if (joke.favourite) {
        btnFav.addEventListener('click', this.removeFromFavourite.bind(joke));
      } else {
        btnFav.addEventListener('click', this.addToFavourite.bind(joke));
      }

      jokeBlock.innerHTML = `<p>${joke.value}</p>
				${joke.categories.length > 0 ? `<p><b>Category</b>: ${joke.categories.join(', ')}</p>` : ``}`;

      jokeBlock.append(btnFav);

      joke.favourite ? jokesWrapperFavourite.append(jokeBlock) : jokesWrapper.append(jokeBlock);
    }

  }

  addToFavourite() {
    this.favourite = true;
    let currentBtn = document.querySelector(`#${this.id}`);
    currentBtn.innerHTML = 'Added into Favourites';
    currentBtn.disabled = true;

    let favJokes = localStorage.getItem('favouriteJokes');

    if (!favJokes) {
      let favJokesArray = [this];
      localStorage.setItem('favouriteJokes', JSON.stringify(favJokesArray));
    } else {
      let favJokesArray = JSON.parse(favJokes);
      favJokesArray.push(this);
      localStorage.setItem('favouriteJokes', JSON.stringify(favJokesArray));
    }

    Joke.getFavouriteJokes();
  }

  removeFromFavourite() {
    this.favourite = false;

    let currentJoke = this;
    let favJokes = JSON.parse(localStorage.getItem('favouriteJokes'));
    favJokes
      .forEach((joke, index, array) => {
        if (joke.id === currentJoke.id) {
          array.splice(index, 1);
        }
      })

    localStorage.setItem('favouriteJokes', JSON.stringify(favJokes));
    Joke.getFavouriteJokes();
  }

  static getFavouriteJokes() {
    jokesWrapperFavourite.innerHTML = '';
    let favJokes = localStorage.getItem('favouriteJokes');

    if (favJokes) {
      let favJokesArray = JSON.parse(favJokes);
      console.log(favJokesArray);
      favJokesArray
        .forEach(joke => {
          let newJoke = new Joke(joke, true);
          newJoke.renderJoke();
        })
    }
  }
}

Joke.getFavouriteJokes();

let formJoke = new Form(
  document.querySelector('#getJoke')
);

console.log(formJoke);