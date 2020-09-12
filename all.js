import zh from './zh_TW.js';

// 自定義設定檔案，錯誤的 className
VeeValidate.configure({
  classes: {
    valid: 'is-valid',
    invalid: 'is-invalid',
  },
});

// 載入自訂規則包
VeeValidate.localize('tw', zh);

// 將 VeeValidate input 驗證工具載入 作為全域註冊
Vue.component('ValidationProvider', VeeValidate.ValidationProvider);
// 將 VeeValidate 完整表單 驗證工具載入 作為全域註冊
Vue.component('ValidationObserver', VeeValidate.ValidationObserver);
// 掛載 Vue-Loading 套件
//註冊再Vue的藍圖、原型 第一層為屬性 第二層為原型(增加了一個$loading的方法在第二層)
Vue.use(VueLoading);
// 全域註冊 VueLoading 並標籤設定為 loading
//卡斯伯老師較推薦此種註冊方式
Vue.component('loading', VueLoading);

new Vue({
  el: '#app',
  data: {
    products: [],
    tempProduct: {
      num: 0,
    },
    status: {
      loadingItem: '',
      loadingUpdataCart: '',
    },
    form: {
      name: '',
      email: '',
      tel: '',
      address: '',
      payment: '',
      message: '',
    },
    cart: {},
    cartTotal: 0,
    isLoading: false,
    UUID: '69d7fd56-1f0f-42c9-b209-51c359d76a0b',
    APIPATH: 'https://course-ec-api.hexschool.io',
  },
  created() {
      //取得產品列表及購物車內容
    this.getProducts();
    this.getCart();
  },
  methods: {
      //可能會重複使用，定義為methods方法
      //取得產品列表資料
    getProducts(page = 1) {
        //loading狀態
      this.isLoading = true;
      //前台取得商品列表api
      const url = `${this.APIPATH}/api/${this.UUID}/ec/products?page=${page}`;
      axios.get(url).then((response) => {
        this.products = response.data.data; //this->可改為 vm = this
        this.isLoading = false;
      });
    },
    //取得單一產品細節資料
    getDetailed(id) {
      this.status.loadingItem = id;

      const url = `${this.APIPATH}/api/${this.UUID}/ec/product/${id}`;

      axios.get(url).then((response) => {
        this.tempProduct = response.data.data;
        // 由於 tempProduct 的 num 沒有預設數字
        // 因此 options 無法選擇預設欄位，故要增加這一行解決該問題
        // 另外如果直接使用物件新增屬性進去是會雙向綁定失效，因此需要使用 $set
        this.$set(this.tempProduct, 'num', 1);

        //上方寫法亦可寫為 es6進階寫法
        // this.tempProduct = {
        //     ...res.data.data,
        //     num:1,
        // };
        $('#productModal').modal('show');
        this.status.loadingItem = '';
      });
    },
    //加入購物車 須帶入商品及數量(預設值為1)
    addToCart(item, quantity = 1) {
      this.status.loadingItem = item.id;

      const url = `${this.APIPATH}/api/${this.UUID}/ec/shopping`;

      const cart = {
        product: item.id,
        quantity, // es6縮寫形式 原本為quantity: quantity,
      };

      axios.post(url, cart).then(() => {
        this.status.loadingItem = '';
        $('#productModal').modal('hide');
        this.getCart();
      }).catch((error) => {
        this.status.loadingItem = '';
        console.log(error.response.data.errors);//axios固定寫法 錯誤訊息必須使用error.response取得
        $('#productModal').modal('hide');
      });
    },
    //取得購物車內容
    getCart() {
      this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/shopping`;

      axios.get(url).then((response) => {
        this.cart = response.data.data;
        console.log(response);
        // 累加總金額
        this.updataTotal();
        this.isLoading = false;
      });
    },
    //重新計算購物車總計
    updataTotal(){
        this.cartTotal = 0;
        this.cart.forEach((item) => {
            this.cartTotal += item.product.price * item.quantity;
          });
    },
    //更新購物車產品數量
    quantityUpdata(id, quantity) {
        this.status.loadingUpdataCart = id;
      // 避免商品數量低於 0 個
      if(quantity <= 0) return;

    //   this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/shopping`;

      const data = {
        product: id,
        quantity,
      };

      axios.patch(url, data).then(() => {
        this.status.loadingUpdataCart = '';
        // this.isLoading = false;
        this.getCart();
      }).catch((error) =>{
          this.isLoading = false;
          console.log(error.response);
      });
    },
    //刪除購物車全部
    removeAllCartItem() {
      this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/shopping/all/product`;

      axios.delete(url)
        .then(() => {
          this.isLoading = false;
          this.getCart();
        });
    },
    //刪除單項購物車產品
    removeCartItem(id) {
      this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/shopping/${id}`;

      axios.delete(url).then(() => {
        this.isLoading = false;
        this.getCart();
      });
    },
    //購物車訂單送出
    createOrder() {
      this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/orders`;

      axios.post(url, this.form).then((response) => {
        if (response.data.data.id) {
          this.isLoading = false;
          // 跳出提示訊息
          $('#orderModal').modal('show');

          // 重新渲染購物車
          this.getCart();
        }
      }).catch((error) => {
        this.isLoading = false;
        console.log(error.response.data.errors);
      });
    },
  },
});