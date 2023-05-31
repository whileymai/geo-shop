window.addEventListener('DOMContentLoaded', (event) => {
  //when the cart is updated
  (function() {
    console.log( "function starts here" );
    const send = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.send = function() { 
      this.addEventListener('load', function() {
        console.log('global handler', this);
        updateBtn(de, true);
      })
      return send.apply(this, arguments)
    }
  })()
  // /when the cart is updated
  
  if( localStorage.getItem("postcode") === null ){
    //geolocation - call only once
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position) {
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        const key = '97934cbe6ef34492ba90489ae3a9d13c'

        const setLocalStorage = () => {
          localStorage.setItem('latitude', JSON.stringify(latitude));
          localStorage.setItem('longitude', JSON.stringify(longitude));
        }

        const getLocalStorage = () => {
          const dataLat = JSON.parse(Number(localStorage.getItem('latitude')));
          const dataLng = JSON.parse(Number(localStorage.getItem('longitude')));
          const locationText = document.querySelector('.location-text');

          var requestOptions = {
            method: 'GET',
          };

          fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${dataLat}&lon=${dataLng}&apiKey=${key}`, requestOptions)
          .then(response => response.json())
          .then(location => {
            const details = location.features[0];

            localStorage.setItem("postcode", details.properties.postcode );
            localStorage.setItem("state", (details.properties.suburb != undefined) ? details.properties.suburb : details.properties.state );

            return details;
          })
          .then((details) => {
            const data = details.properties;
            //update details template            
            locationText.innerHTML = `<span><span class="">Deliver to ${(data.state != undefined) ? data.state : data.country }</span> ${(data.postcode != null) ? data.postcode : ''} </span>`;
            document.getElementById("address_id").value = localStorage.getItem("postcode");
            return details;
          })
          .then((details) => {
            const data = details.properties;
          })
          .catch(error => console.log('error', error));
        }
        setLocalStorage();
        getLocalStorage();

      }, function(err){
        console.log('could not get position');
      });
      //set local storage
    }
  }else{
    var state = localStorage.getItem("state"),
        postcode = localStorage.getItem("postcode");
    if(postcode == 'undefined') postcode = '';
    document.querySelector('.location-text').innerHTML = `<span><span class="">Deliver to ${state}</span> ${postcode}</span>`;
  }

  //if geolocation is denined - show the modal but only a single time when decline is clicked
  navigator.geolocation.watchPosition(function(position) {
    console.log("geolocation tracking");
  },function(error) {
    if (error.code == error.PERMISSION_DENIED){
      if( localStorage.getItem("watchLocation") === null ){
        document.querySelector(".location_modal").style.display = "flex";
        document.body.classList.add("position-fixed");
        document.body.style.overflowY = "hidden";
      }
      var state = localStorage.getItem("state"),
          postcode = localStorage.getItem("postcode");
      
      if(postcode || state){
        if(postcode == 'undefined') postcode = '';
        document.querySelector('.location-text').innerHTML = `<span><span class="">Deliver to ${state}</span> ${postcode}</span>`;
      } else {
        document.querySelector('.location-text').innerHTML = `<span><span class="">Deliver to Richmond</span> 3121</span>`;
      }
    }
  });
  //END if geolocation is denined - show the modal

  var btnShowLocation = document.querySelector(".showLocation");
  var btnCloseLocation = document.querySelector(".closeLocModal");

  btnShowLocation.onclick = function(e){
    e.preventDefault();
    document.querySelector(".location_modal").style.display = "flex";
    document.body.classList.add("position-fixed");
    document.body.style.overflowY = "hidden";

    document.querySelector(".listOfAddress").innerHTML = "";
    document.querySelector("#confirmLocation").style.display = "none";
  }

  btnCloseLocation.onclick = function(e){
    e.preventDefault();
    document.querySelector(".location_modal").style.display = "none";
    document.body.classList.remove("position-fixed");
    document.body.style.overflowY = "visible";
  }
  
  var modal = document.querySelector(".location_modal");
  window.onclick = function(e){
     if (e.target === modal) {
       document.querySelector(".location_modal").style.display = "none";
       document.body.classList.remove("position-fixed");
       document.body.style.overflowY = "visible";      
    }
  }

  //PDP page available location postcodes popup
  var btnShowPostcodes = document.querySelector(".js-location-postcodes");
  var btnClosePostcodes = document.querySelector(".closeLocModalPostcodes");
if(btnShowPostcodes){
  btnShowPostcodes.onclick = function(e){
    e.preventDefault();
    document.querySelector(".available_location_modal").style.display = "flex";
    document.body.classList.add("position-fixed");
    document.body.style.overflowY = "hidden";
  }

  btnClosePostcodes.onclick = function(e){
    e.preventDefault();
    document.querySelector(".available_location_modal").style.display = "none";
    document.body.classList.remove("position-fixed");
    document.body.classList.remove("unloading");
    document.body.style.overflowY = "visible";
  }
  
  var modalPostcodes = document.querySelector(".available_location_modal");
  window.onclick = function(e){
    if (e.target === modalPostcodes) {
       document.querySelector(".available_location_modal").style.display = "none";
       document.body.classList.remove("position-fixed");
       document.body.classList.remove("unloading");
       document.body.style.overflowY = "visible";      
    }
  }
}
  
  //disable/enable the add to cart button instances
  //pass in change conditons function via de
  updateBtn(de, true);
  
  //required as the sections are loaded on window scroll
  document.body.onscroll = function(e){
    if(e.target.onscroll)
      return;
    
    updateBtn( de , false);
    e.target.onscroll = true;
  }

  function updateBtn(de, flag){
    console.log("update btn called", flag);
    var loc = localStorage.getItem("postcode");

    //for product page
    if(document.body.classList.contains("template-product") ){
      var prodContainer = document.querySelectorAll("div[id^=ProductSection-template]");
      prodContainer.forEach( function(item, index){
      	var availablePostcodes = item.querySelectorAll("input[name=availablePostcodes]"),
            btn = null;
        console.log( "product page", availablePostcodes );

        availablePostcodes.forEach( function( item, index ){
          if(item != null){
            if(item.value != ''){
              btn = item.nextElementSibling;
              console.log( btn, "btn" );
              if(item.value.includes(loc)){
                //check sold-out or not
                if(btn.getAttribute("data-available") === null ){
                  btn.removeAttribute("disabled");
                  btn.innerHTML = "Add to cart";
                }
              } else{
                btn.setAttribute("disabled", "disabled");
                btn.innerHTML = "N/A in your area";
              }
            }
          }
        });
      });
    }
    //for collection page
    if(document.body.classList.contains("template-collection") ){
      var availablePostcodes = document.body.querySelectorAll("input[name=availablePostcodes]");
      availablePostcodes.forEach(function(item, index){
        de(item);
      });
    }
    //recently viewed section
    var containerRec = document.querySelector("div[id^=RecentlyViewed-template"),
        containerVen = document.querySelector("div[id^=VendorProducts-template"),
        containerMore = document.querySelector("div[id$=more-products-collection"),
        containerRecomm = document.querySelector("div[id^=Recommendations-"),
        containerCollection = document.querySelector("div[id^=CollectionAjaxContent"),
        containerCollectionSection = document.querySelector("div[id^=CollectionSection-template"),
        containerCartSection = document.querySelector(".cart-recommendations");
   
    setTimeout( function(){
      
      if( flag ){
        //for cart page
        var pContainer = null;
        if(document.body.classList.contains("template-cart") ){
          pContainer = document.querySelector("form[action='/cart'][data-location='page']");
        }else{
          pContainer = document.querySelector("form[action='/cart'][data-location='header']");
        }

        console.log( "pcontainer", pContainer );

        var availablePostcodes = pContainer.querySelectorAll(".cart__item input[name=availablePostcodes]"),
            btn = null;

        console.log("cart page", availablePostcodes);
        var anyNAItem = false; 
        if(availablePostcodes != null){
          availablePostcodes.forEach( function(item, index) {
            if(item.value != ''){
              console.log("loc", loc);
              if(item.value.includes(loc)){
                var msg = item.closest('.cart__item').querySelector(".geo_msg");
                if (msg !== null) {
                  msg.remove();
                }
              } else{
                anyNAItem = true;
                var msg = document.createElement("span");
                msg.classList.add("geo_msg");
                msg.innerHTML = "N/A in your area";
                if( item.parentElement.querySelector(".geo_msg") == null )
                  item.parentElement.append(msg);
             }
            }
          });
        }
        btn = pContainer.querySelector("button[name=checkout]");
        if(anyNAItem == false){
          btn.removeAttribute("disabled");
          btn.innerHTML = "Checkout";
        } else {
          btn.setAttribute("disabled", "disabled");
          btn.innerHTML = "Please remove the N/A products from cart to continue checkout";
        }
      }
      
      if(containerCollection){
        de(containerCollection);
      }
      
      if(containerRecomm){
        de(containerRecomm);
      }
      
      if(containerVen){
        de( containerVen );
      }

      if(containerMore){
        de( containerMore );
      }

      if(containerRec){
        de( containerRec );
      }
      
      if(containerRec){
        de( containerRec );
      }
      
      if(containerCartSection){
        de(containerCartSection);
      }
      
    }, 2000);
  }

  //change conditons on add to cart button
  function de(containerClass){
    var __availablePostcodes = containerClass.querySelectorAll("input[name=availablePostcodes]");
    __availablePostcodes.forEach( function(item, index){
        if(item != null){
          if(item.value != ''){
            var loc = localStorage.getItem("postcode");
            var title = item.nextElementSibling.getAttribute("title");
            var color = item.nextElementSibling.children[0].style.backgroundColor;
            if(item.value.includes(loc)){
              item.nextElementSibling.removeAttribute("disabled");
              item.nextElementSibling.setAttribute("title", title);
              item.nextElementSibling.children[0].style.backgroundColor = color;
            } else {
              item.nextElementSibling.setAttribute("disabled", "disabled");
              item.nextElementSibling.setAttribute("title", "N/A in your area"); //#a59f9f
              item.nextElementSibling.children[0].style.backgroundColor = "#a59f9f";
            }
          }
        }
    });
    
    return;
  }

  //START retreive location data on field input
  document.getElementById("address_id").onkeyup = function(e){
    const key = '97934cbe6ef34492ba90489ae3a9d13c';

    var requestOptions = {
      method: 'GET'
    },
        addressList = document.querySelector(".listOfAddress"),
        loader = document.querySelector(".location_modal .loader")

    //show loading
    loader.style.display = "inline-block";
    loader.innerHTML = 'Loading...';
    
    //hide previous results if any
    if( addressList.querySelector("ul") != null )
      addressList.querySelector("ul").innerHTML = '';

    //limit resposnse from geoapify to australia only
    if(document.getElementById("address_id").value.length != 0) {
      var pattern = /[0-9]/g,
          text = document.getElementById("address_id").value,
          url = '';
      if( pattern.test(text) ){
        url = 'https://api.geoapify.com/v1/geocode/autocomplete?text='+this.value+'&type=postcode&filter=countrycode:au&format=json&apiKey='+key+''
      }else{
        url = 'https://api.geoapify.com/v1/geocode/search?text='+this.value+'&type=amenity&filter=countrycode:au&format=json&apiKey='+key+'';
      }
      fetch(url
            , requestOptions)
      .then(response => response.json())
      .then(location => {

        var ul = document.createElement("ul");
        ul.style.marginLeft = '0';
        ul.classList.add('list-unstyled');

        let locationResults = location.results;

        if( addressList.querySelector("ul") != null )
          addressList.querySelector("ul").innerHTML = '';
       
        //prevent postcodes begining with 6 = Brisbane
        // if(document.getElementById("address_id").value.length != 0 && !document.getElementById("address_id").value.toString().startsWith('6')){

          if(document.getElementById("address_id").value.length != 0){
          if( locationResults != undefined ){
            locationResults.forEach(function(item, index){

              ul.innerHTML = '';
              ul.style.marginLeft = '0';
              ul.classList.add('show-results');

              var loc = `${item.address_line1}, ${(item.state !== undefined) ? item.state : item.city }`;//previously address_line2 
              var li = document.createElement("li");

              li.style.listStyleType = 'none';
              li.style.marginTop = '20px';
              li.style.cursor = "pointer";

              li.setAttribute("data-postcode", item.postcode);

              if(item.state != undefined)
                li.setAttribute("data-state", item.state);
              else
                li.setAttribute("data-state", item.suburb);

              li.setAttribute("data-latitude", item.lat);
              li.setAttribute("data-longitude", item.lon);
              li.setAttribute("class", "listLocation");

              //list items
              li.innerHTML = loc;
              if( addressList.querySelector("ul") === null )
                ul.append(li);
              else{
                //hide loading
                loader.style.display = "none";
                addressList.querySelector("ul").append(li);
              }
            });
            addressList.style.display = "block";
            if( addressList.querySelector("ul") === null ){
              addressList.append(ul);
              //hide loading
              loader.style.display = "none";
            }
          }
          //if results are empty - international, show message
          if( locationResults.length === 0){
            loader.style.display = "block";
            loader.innerHTML = `Unable to deliver to this location`;
            loader.classList.add('alert-info');
          }
        }
        //if input has a value but the post code begins with a 6, show message
        else if(document.getElementById("address_id").value.length != 0 && document.getElementById("address_id").value.toString().startsWith('6')) {
            addressList.style.display = "none";
            loader.innerHTML = `Unable to deliver to this location`;
            loader.classList.add('alert-info');
        }
        else {
          addressList.style.display = "none";
        }
        document.querySelectorAll(".listLocation").forEach(function(item, index){
          item.addEventListener("click", function(){
            document.getElementById("address_id").value = item.innerHTML;

            document.getElementById("address_id").setAttribute("data-postcode", item.getAttribute("data-postcode"));
            document.getElementById("address_id").setAttribute("data-state", item.getAttribute("data-state"));
            document.getElementById("address_id").setAttribute("data-latitude", item.getAttribute("data-latitude"));
            document.getElementById("address_id").setAttribute("data-longitude", item.getAttribute("data-longitude"));
            
            function insertAfter(referenceNode, newNode) {
              referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
            }

            const confirmEl = document.querySelector("#confirmLocation");
            var createEl = document.createElement("span");//create element
            var geoDiv = document.querySelector(".geo-loockup");//reference sibling
            confirmEl.setAttribute("id", 'confirmLocation')//set attribute
            confirmEl.style.display = "inline-block";//show element
            confirmEl.style.marginTop = '10px';//style element

            //run function
            insertAfter(geoDiv, confirmEl);
            
            //hide results
            document.querySelector('.listOfAddress').style.display = "none";

          });
        });
        document.getElementById('confirmLocation').addEventListener('click', function(e) {
          e.preventDefault();
          const locSelected = document.getElementById("address_id");
          localStorage.setItem("postcode", locSelected.getAttribute("data-postcode"));
          localStorage.setItem("latitude", locSelected.getAttribute("data-latitude"));
          localStorage.setItem("longitude", locSelected.getAttribute("data-longitude"));
          localStorage.setItem("state", locSelected.getAttribute("data-state"));
          
          var text1 = locSelected.getAttribute("data-state"),
              text2 = locSelected.getAttribute("data-postcode") == 'undefined' ? '' : locSelected.getAttribute("data-postcode");

          document.querySelector('.location-text').innerHTML = `<span><span class="">Deliver to ${text1}</span> ${text2}</span>`;
          
          //close the modal
          document.querySelector(".location_modal").style.display = "none";
          document.body.classList.remove("position-fixed");
          document.body.style.overflowY = "visible";

          //check if watchPosition needs to be called or not
          localStorage.setItem("watchLocation", true );

          updateBtn(de, true);
          
          //reload page
          window.location.reload();
          
        });
      })
      .catch((err) => {
        console.log(err);      
      }); 
    } else{
    //hide loading and confirm button
       loader.style.display = "none";
       document.querySelector('#confirmLocation').style.display = "none";
    }
  }
  //END retreive location data on field input
});
