const mainpanel = document.querySelector('.mainpanel')
const cartIcon = document.querySelector('.cart-icon')
const cartClose = document.querySelector('.close-icon')
const cartPanel = document.querySelector('.cart-panel')
const cartTotal = document.querySelector('.cart-total')
const cartItems = document.querySelector('.cart-it')
const cartContent = document.querySelector('.cart-content')
const removebtns = document.querySelector('.remove-item')


let cart = []
let btnsDOM = []

class Products {

    async getProducts(){
     try {
       let res =  await fetch("../sticks.json")
       let data = await res.json()
       return data
     } catch (error) {
       console.log(error)
     }
    }
}

class UI {
    displaySticks(data) {
     let output = ''
     data.forEach(product => {
       output += `
         <div class="sticks"${product.id}">
        <div class="card" style="width: 16rem; height: 20rem;">
          <img src="${product.img}" class="card-img-top"  alt="stick">
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <h6 class="card-title">${product.description}</h6>
            <div>
              <button type="button" class="btn btn-info"  disabled>$${product.price}</button>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <button type="button" class="btn btn-outline-primary" data-id="${product.id}">Add to cart</button>
            </div>
          </div>
        </div>
      </div>
       `
     })
     mainpanel.innerHTML = output
   } 

  setApp() {
    cartIcon.addEventListener('click', this.showCart)
    cartClose.addEventListener('click', this.hiddecart)
    cart = Storage.getCart()
    this.setCartValues(cart)
    this.populateCart(cart)
  }

  populateCart(cart) {
     cart.forEach(item => this.addCartItem(item))
  }

  showCart() {
    cartPanel.classList.add('show')
  }

  hiddecart() {
    cartPanel.classList.remove('show')
  }

  getBtn() {
    const btns = [...document.querySelectorAll('.btn-outline-primary')]
     btnsDOM = btns;

     btns.forEach(btn => {
      let id = btn.dataset.id
      //console.log(id)
       let inCart = cart.find(item => item.id === id)
        if(inCart){
          btn.innerText = 'in cart'
        } else {
          btn.addEventListener('click', e => {
             e.target.innerText = 'In Cart'
             e.target.disabled = true
             
             let cartItem = {...Storage.getProduct(id), amount:1}
             //console.log(cartItem)
             cart = [...cart, cartItem]// set up for cart
             //console.log(cart)
             Storage.saveCart(cart)
             this.setCartValues(cart)
             this.addCartItem(cartItem)     
          })
        }
       })
    }

   setCartValues(cart) {
       let tempTotal = 0
       let itemsTotal = 0
       cart.map(item => {
         tempTotal += item.price * item.amount
         itemsTotal += item.amount
       })
       cartTotal.innerHTML = parseFloat(tempTotal.toFixed(2))
       cartItems.innerHTML = itemsTotal
       console.log(cartTotal, cartItems)
    }
    
    addCartItem(item){
      const div = document.createElement('div')
      div.classList.add('cart-item')
      div.innerHTML = `
           <img src="${item.img}" class="cart-img" alt="product">
            <div class="titles">
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item pointer" data-id=${item.id}>remove</span>
            </div>
            <div class="sipky">
              <i class="fas fa-chevron-up pointer" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down pointer" data-id=${item.id}></i>
            </div>
      `
      cartContent.appendChild(div)
      //console.log(cartContent)
    }

   cartLogic() {
     
      // removin + increasing  - decreasing  item
     cartContent.addEventListener('click', e=> {
       //console.log(e.target)
        if(e.target.classList.contains('remove-item')){
          let removeItem = e.target
          let id = removeItem.dataset.id
          cartContent.removeChild(removeItem.parentElement.parentElement)
          this.removeItem(id)
        } else if(e.target.classList.contains('fa-chevron-up')){
          let increase = e.target
          let id = increase.dataset.id
          let tempItem = cart.find(item => item.id === id)
          tempItem.amount++
          Storage.saveCart(cart)
          this.setCartValues(cart)
          increase.nextElementSibling.innerHTML = tempItem.amount
        } else if(e.target.classList.contains('fa-chevron-down')){
          let decrease = e.target
          let id = decrease.dataset.id
          let tempItem = cart.find(item => item.id === id)
          tempItem.amount--
          if(tempItem.amount > 0){
             Storage.saveCart(cart)
          this.setCartValues(cart)
          decrease.previousElementSibling.innerHTML = tempItem.amount
          } else {
             cartContent.removeChild(decrease.parentElement.parentElement)
             this.removeItem(id)
          }
        } 
     })
   }

   removeItem(id){
     cart = cart.filter(item => item.id !== id) 
     this.setCartValues(cart)
     Storage.saveCart(cart)
     let btn  = this.getSingleBtn(id)
     btn.disabled = false
     btn.innerText = 'add to card'    
   }

   getSingleBtn(id) {
     return btnsDOM.find(btn => btn.dataset.id === id)
   }

}



class Storage {

  static saveProducts(data){
    localStorage.setItem('products' , JSON.stringify(data))
  }

  static getProduct(id) {
    let data = JSON.parse(localStorage.getItem('products'))
    // return if product.id === id else undefine
    return data.find(product => product.id === id)
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  static getCart() {
    return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
  }

  
}


document.addEventListener('DOMContentLoaded', async () => {
  const products = new Products()
  const ui = new UI()
  
  


  products.getProducts().then(data => {
    //console.log(data)
    ui.displaySticks(data)
    Storage.saveProducts(data)
  }).then(() => {
    ui.getBtn()
    ui.cartLogic()
  })

  ui.setApp()
})