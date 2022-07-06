import { $, all } from './DOMHelper.js';
import * as api from './api.js';
import * as template from './template.js';

const productAttach = (result) => {

    const what_page = $('.content').getAttribute('id');

    if (what_page == "catalog") {
        $('.query-info').innerHTML = `Showing 0 of 0 results`;
        $('.product-list').innerHTML = '<h1>Your product isnt available</h1>';
    
        if (result) {
            $('.query-info').innerHTML = `Showing ${result.total} of ${result.total} results`;
            $('.product-list').innerHTML = result.el;
        }
    }
}

const cartReplace = (result) => {
    $('.select-items').innerHTML = result;
    $('.cart-icon').innerHTML = "<span></span>";

    removeCartRegis();
}

const removeCartRegis = () => {
    const cart_product = all('.remove-cart');
    const what_page = $('.content').getAttribute('id');

    cart_product.forEach(el => {
        el.addEventListener("click", async (e) => {
            const product_id = e.target.getAttribute('product_id');
            const result = await api.removeCart(product_id);
            
            if ($(`.cart-btn[product_id="${product_id}"]`)) {
                $(`.cart-btn[product_id="${product_id}"]`).className = "bi bi-cart-plus cart-btn";
            }

            if ($(`.card-cart[product_id="${product_id}"]`)) {
                $(`.card-cart[product_id="${product_id}"]`).classList.add("remove");

                setTimeout(() => {
                    $(`.card-cart.remove`) ? $(`.card-cart.remove`).remove() : '';
                    calculateSummary();
                    
                    if (what_page == 'shopping-cart') {
                        if (!all('.card-cart').length) {
                            $('.list-cart').innerHTML = `You don't have any product in your cart`;
        
                            $('.proceed-btn').setAttribute('disabled', 'disabled');
                        }
                    }
                }, 500);
            }
            

            if (result == false) {
                $('.select-items').innerHTML = "";
                $('.cart-icon').innerHTML = "";
            } else {
                cartReplace(result);
            }
        });
    });
}

const wishlistRegis = () => {
    const product_wishlist = all('.wishlist');

    if (product_wishlist.length > 0) {
        product_wishlist.forEach(el => {
            el.addEventListener('click', async (e) => {
                e.preventDefault();

                const product_id = e.target.getAttribute('product_id');
                const wishlist = await api.wishlistAction(product_id);

                if (wishlist.type == "addWishlist") {
                    $(`.wish-btn[product_id="${product_id}"]`).className = "bi bi-heart-fill fill-btn wish-btn";
                    flashMessaage("Product added to wishlist");
                }

                if (wishlist.type == "removeWishlist") {
                    $(`.wish-btn[product_id="${product_id}"]`).className = "bi bi-heart love-btn wish-btn";

                    const wishlist_product = $(`#wishlist_${product_id}`);

                    if (wishlist_product) {
                        wishlist_product.classList.add('remove');

                        setTimeout(() => {
                            wishlist_product.remove();
                            
                            if (!all('.product').length) {
                                $('.product-list').innerHTML = `<h1>You don't have wishlist product</h1>`
                            }
                        }, 500);

                    }
                }
            });
        });
    }
}

const addCartRegis = () => {
    const product_cart = all('.add-cart');

    product_cart.forEach(el => {
        el.addEventListener('click', async (e) => {
            const product_id = e.target.getAttribute('product_id');
            const result = await api.addCart(product_id);

            if (result) {
                $(`.cart-btn[product_id="${product_id}"]`).className = "bi bi-cart-check-fill cart-btn";
                flashMessaage("Product added to cart")
                cartReplace(result);
            }
        });
    });
}

const flashMessaage = (message) => {
    const flash_message = $('.flash-message');
    const message_el =  $('.flash-message .message');

    message_el.innerHTML = message;
    flash_message.classList.add('show');

    setTimeout(() => {
        flash_message.classList.remove('show');
    }, 1000);
}

const addAddressRegis = () => {
    const add_btn = $('.add-address');

    if (add_btn) {
        add_btn.addEventListener('click', async () => {
            const template = await api.getCountry();
            $('#address-modal').innerHTML = template
            saveAddressRegis();
            closeModalBtnRegis();
        });
    }
}

const editAddressRegis = () => {
    const edit_btn = all(".edit-address");

    edit_btn.forEach(el => {
        el.addEventListener('click', async (e) => {
            e.preventDefault();

            const address_id = e.target.getAttribute('address_id');
            const result = await api.editAddress(address_id);

            $('#address-modal').innerHTML = template.addModal();

            if (result) {
                $('#address_id').value = result.id;
                $('#label-address').value = result.title_address;
                $('#recipient').value = result.recipient;
                $('#phone').value = result.phone_no;
                $('#city').value = result.city;
                $('#post-code').value = result.postal_code;
                $('#address').value = result.address;
                $('#country').value = result.country;
            }
            
            saveAddressRegis();
            closeModalBtnRegis();
        });
    });
}

const saveAddressRegis = () => {
    const save_address = $('.save-address');
    
    if (save_address) {
        save_address.addEventListener('click', async (e) => {
            e.preventDefault();

            let title_address = $('#label-address').value;
            let recipient = $('#recipient').value;
            let phone_no = $('#phone').value;
            let city = $('#city').value;
            let postal_code = $('#post-code').value;
            let address = $('#address').value;
            let country = $('#country').value;

            const data = {
                recipient,
                title_address,
                phone_no,
                address,
                city,
                postal_code,
                country
            }

            if ($('#address_id').value != '') {
                data.address_id = $('#address_id').value;
            }

            const result = await api.saveAddress(data);

            if (result) {
                $('#address-modal').innerHTML = result;

                selectAddressRegis();
                addAddressRegis();
                editAddressRegis();

                if (data.address_id ==  $('#address_input').value) {
                    location.reload();
                }
            }
        });
    }
}

const selectAddressRegis = () => {
    const address_list = all(".select-address");
    
    address_list.forEach(el => {
        el.addEventListener('click', async (e) => {
            e.preventDefault();

            const address_id = e.target.getAttribute('address_id');
            const result = await api.selectAddress(address_id);

            if (result) {
                location.reload();
            }
        });
    });
}

const closeModalBtnRegis = () => {
    const close_btn = all('.form-close');

    close_btn.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();

            const timeout = $('.modal-dialog').classList.contains('add-address') ? 500 : 0;
            
            setTimeout(async () => {
                const result = await api.getAddress();
    
                if (result) {
                    $('#address-modal').innerHTML = result;
                    addAddressRegis();  
                    editAddressRegis(); 
                    selectAddressRegis();
                }
            }, timeout);
        });
    });
}

const calculateSummary = () => {
    const input_product = all('.input-product');
    const product_list = Array.from(input_product).map((el) => el.getAttribute('id').split('_').at(2));

    const subtotal = product_list.reduce((total, id) => {
        const quantity = Number($(`#quantity_${id}`).innerHTML);
        const price = Number($(`#price_${id}`).getAttribute('price'));

        return total += (price * quantity);
    }, 0);

    const tax = Math.floor(subtotal * 10 / 100);
    const shipping = input_product.length ? 200000 : 0;
    const grandtotal = subtotal + tax + shipping;
    
    if ($('#shopping-cart')) {
        $('.detail__total span').innerHTML = "Rp. " + subtotal.toLocaleString('en-US');
        $(`.detail__tax span`).innerHTML = "Rp. " + tax.toLocaleString('en-US');
        $(`.detail__shipping span`).innerHTML = "Rp. " + shipping.toLocaleString('en-US');
        $(`.detail__grand-total`).innerHTML = "Rp. " + grandtotal.toLocaleString('en-US');
    }
}

(function () {
    wishlistRegis();
    addCartRegis();
    removeCartRegis();
    selectAddressRegis();
    saveAddressRegis();
    addAddressRegis();
    editAddressRegis();
})();


(function () {
    const search = $('.search-icon');

    if (search) {
        search.addEventListener("click", async () => {
            $('.search-form').classList.toggle('show');
            
            const search_class = ($('.search-form').className).split(' ').includes('show');
    
            if (!search_class) {
                $('.search').value = '';
                const result = await api.productFilter('');
                productAttach(result);
    
                localStorage.removeItem('name');
    
                wishlistRegis();
                addCartRegis();
            }
        });
    }
})();

(function () {
    const list = all('.category-list');

    if (list) {
        list[0]?.classList.add('active');
        
        list.forEach((el, i, list) => {
            el.addEventListener('click', async (e) => {
                const category = e.target.getAttribute('category');
    
                const result = await api.productFilter(`category=${category}`);
                productAttach(result);
                
                list.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');

                wishlistRegis();
                addCartRegis();
            });
        })
    }
})();

(function () {
    const el_search = $('.search');

    if (el_search) {
        el_search.addEventListener("input", async () => {
            const search_value = el_search.value;
    
            const content = $('.content');
            const what_page = content.getAttribute('id');
    
            if (what_page != "catalog") {
                document.location = "catalog.php";
            }
    
            const result = await api.productFilter(`filter=${search_value}`);
            productAttach(result);
    
            wishlistRegis();
            addCartRegis();
        });
    }
})();

(async function () {
    const filter = localStorage.getItem('name');

    if (filter != '' && filter != null) {
        $('.search-form').classList.toggle('show');
        $('.search').value = filter;        

        const result = await api.productFilter(`filter=${filter}`);
        productAttach(result);

        wishlistRegis();
        addCartRegis();
    }
})();

(function () {
    const min_btn = all(".total-btn .min-btn");
    const max_btn = all(".total-btn .max-btn");

    if (min_btn.length > 0 && max_btn.length > 0) {
        min_btn.forEach(el => {
            el.addEventListener('click', (e) => {
                const product_id = e.target.getAttribute('product_id');

                if ($(`.total-btn span[product_id="${product_id}"]`).innerHTML > 1) {
                    let price = Number($(`#price_${product_id}`).getAttribute('price'));
                    let total = parseInt($(`.total-btn span[product_id="${product_id}"]`).innerHTML) - 1;

                    $(`.total-btn span[product_id='${product_id}']`).innerHTML = total
                    $(`#product_input_${product_id}`).value = total;
                    $(`#price_${product_id}`).innerHTML = 'Rp. ' + (price * total).toLocaleString('en-US');

                    calculateSummary();
                }
            });
        });

        max_btn.forEach(el => {
            el.addEventListener('click', (e) => {
                const product_id = e.target.getAttribute('product_id');

                if ($(`.total-btn span[product_id="${product_id}"]`).innerHTML >= 1 && $(`.total-btn span[product_id="${product_id}"]`).innerHTML < 10 ) {
                    let price = Number($(`#price_${product_id}`).getAttribute('price'));
                    let total = parseInt($(`.total-btn span[product_id="${product_id}"]`).innerHTML) + 1;

                    $(`.total-btn span[product_id='${product_id}']`).innerHTML = total;
                    $(`#product_input_${product_id}`).value = total;
                    $(`#price_${product_id}`).innerHTML = 'Rp. ' + (price * total).toLocaleString('en-US');

                    calculateSummary();
                }
            });
        });
    }
})();