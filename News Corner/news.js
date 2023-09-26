//calling api for news categories
let loadCategories = () => {
    document.getElementById('error-message').style.display = 'none';
    fetch('https://openapi.programming-hero.com/api/news/categories')
    .then(response => response.json())
    .then(data => displayCategories(data.data.news_category))
    .catch(error => displayError(error));
    
}

//displaying error
let displayError = error => {
    document.getElementById('error-message').style.display = 'block';
    alert(error);
}

loadCategories();

// displaying the categories
function displayCategories (news_categories) {
    let categories = document.getElementById('categories');     
    news_categories.forEach(category => {
        let div = document.createElement('div');
        div.innerHTML = `
        <p onclick="categoryDetails('${category.category_id}', '${category.category_name}')">${category.category_name}</p>
        `
        categories.appendChild(div);
    });
}

//calling api to load a single category's news
function categoryDetails(category_id, category_name) {
    toggleSpinner('block');
    document.getElementById('error-message').style.display = 'none';
    //preveting category_id from being number automatically and keeping the original format
    let category_id_in_string = category_id.toString();
    if (category_id_in_string.length < 2) {
        category_id_in_string = "0" + category_id_in_string
    }
    fetch(`https://openapi.programming-hero.com/api/news/category/${category_id_in_string}`)
    .then(response => response.json())
    .then(data => displayCategoryDetails(data.data, category_name))
    .catch(error => displayError(error));
}

//display spinner
let toggleSpinner = displayStatus => {
    document.getElementById('spinner').style.display = displayStatus;
}

// displaying single category news details
function displayCategoryDetails(data, category_name) {
    let categoryItemCount = document.getElementById('category-item-count');
    categoryItemCount.innerHTML = '';
    toggleSpinner('none');
    // showing news result found count for this category
    categoryItemCount.innerHTML = showResultCount(data, category_name); 
    displayNewsDetails(data);
}

let showResultCount = (data, category_name) => {
    if (data.length < 1) {
        return `No news found for the category of ${category_name}`;
    }
    else {
        return `
        <p style=" padding: 0.75rem; color: black;">
        <span  style="  font-weight: normal; color: #000;  font-weight: bold;"> ${data.length} </span> news found for the category of <span style="  font-weight: normal; color: #000;" style=" font-style: italic;"> ${category_name}</span>
      </p>
        `  
    }
}

let displayNewsDetails = (allNews) => {
    let newsContainer = document.getElementById('news-details-container');
    //sorting all news with total view count
    allNews.sort(function(a, b){
        return b.total_view - a.total_view;
    });

    // clearing previous result 
    
    newsContainer.innerHTML = '';
    allNews.forEach(singleNews => {
        let div = document.createElement('div');
        div.classList.add('col');
        let date = singleNews.author.published_date?.split(" ")[0];
        let description = displayDescription(singleNews.details);
        div.innerHTML = `
        <div style="  border: 1px solid #000;
        border-radius: 0.25rem; display: flex; flex-direction: row; flex-wrap: wrap; background-color: #fff; box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);">
           <div  style=" display: flex; flex-direction: column; flex-wrap: wrap;">
             <img src="${singleNews.thumbnail_url}" style=" height: 100%; width: 100%; max-width: 90%;" alt="related picture of a news">
         </div>

         <div style=" flex: 1; padding-left: 0.5rem; padding-right: 1rem; display: flex; align-items: center; margin-top: 0.75rem; padding: 0.75rem;">
                <div>
                    <h5>${singleNews.title}</h5>
                    <small>${description}</small>
                    <div style=" display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-top: 0.75rem;">

                        <!-- author part-->

                        <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                            <!-- image part-->
                            <img style="width:30px; height:30px; border-radius:25px" src="${singleNews.author.img}" class="me-1" alt="picture of the author">

                            <!-- text part-->
                            <div class="custom-info-container">
                            <p style="  margin: 0; font-size: 0.875rem;">${getInfo(singleNews.author.name, 'Author name')}</p>
                            <p style=" margin: 0; font-size: 0.875rem;  color:#6c757d;">${getInfo(date, 'Date')}</p>
                          </div> 
                        </div>

                        <!-- view part-->
                        <div style=" padding-left: 0.75rem;">  
                        
                            <i class="fa-solid fa-eye"></i> <small>${getInfo(singleNews.total_view, 'View info')}</small>
                        </div>

                        <!-- Read more part-->
                        <div style="margin-right: 1.25rem;">
                        
                <button type="button" style="text-decoration: rgb(81, 132, 183);" 
                  onclick="displayModalDetails('${singleNews._id}')" data-bs-toggle="modal" data-bs-target="#newsModal">
                  Read more <i class="custom-icon fas fa-angle-right"></i>
                </button>
              </div> 
                    </div>
                </div>
            </div>
        </div>
        `
    newsContainer.appendChild(div);    
    });
}

let displayDescription = text => (text.length > 400 ? text.slice(0, 400) + ' ...' : text)
        
// returning author info
let getInfo = (value, valueTypeName) => value ? value : valueTypeName + ' not found';

// load modal

let displayModalDetails = (news_id) => {
    fetch(`https://openapi.programming-hero.com/api/news/${news_id}`)
        .then(response => response.json())
        .then(data => displaySingleNewsOpenModal(data.data[0]))
};
// console.log("o my god");

let displaySingleNewsOpenModal = (newsId) => {
    const newsDetails = document.getElementById('news-details');
    let date = newsId.author.published_date?.split(" ")[0];
    newsDetails.innerHTML = `
            <div style=" justify-content: center; align-items: center;">
                <a href=""><img id="profile-picture" src="${newsId.thumbnail_url}" alt="profile-picture"></a>
            </div>
        <h6 style="color: #007bff;">News Title: ${newsId.title ? newsId.title : 'No Title Found'}</h6>
        <p style="  color: #6c757d; " description: ${displayDescription(newsId.details)}</p>
        <p>Author Name: ${newsId.author.name ? newsId.author.name : 'No Author Name Found'}</p>
        <p>Date: ${getInfo(date, 'Date')}</p>
        <p style="  color: #ffc107; " >Rating: ${newsId.rating.number ? newsId.rating.number : 'No Rating Found'}</p>
        <p style="  color: #ffc107; " >Rating Quality: ${newsId.rating.badge ? newsId.rating.badge : 'No Badge Found'}</p>
        <p>Total View: ${newsId.total_view ? newsId.total_view : 'No Total View Found'}</p>
    `;
    
}