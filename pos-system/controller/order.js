// Auto-generate order ID
import {customer} from "../db/db.js";
import {items} from "../db/db.js";
import {OrderModel} from "../model/OrderModel.js";
import {orders} from "../db/db.js";

function generateOrderId() {
    const orderIdInput = $('#order-id');
    const orderIdPrefix = "ORD-";
    const orderIdNumber = String(customer.length + 1).padStart(4, '0');
    orderIdInput.val(orderIdPrefix + orderIdNumber);
}

// Call generateOrderId when the page loads
$(document).ready(function () {
    generateOrderId();
});

// Load customer IDs into the combo box and set up event listeners
export function loadCombos(array, comboBoxId) {
    console.log("combo-box loaded", array, comboBoxId);
    var comboBox = $('#' + comboBoxId);

    // Clear existing options
    comboBox.empty();

    // Add a default option
    comboBox.append($('<option>', {
        value: '',
        text: 'Select Customer ID...'
    }));

    // Iterate through the array and add options
    array.forEach(function (customer) {
        comboBox.append($('<option>', {
            value: customer.id,
            text: customer.id
        }));
    });
}

$('#customer-id-order').on('change', () => {
    var selectedId = $('#customer-id-order').val();
    var selectedCustomer = customer.find(c => c.id == selectedId);

    if (selectedCustomer) {
        $('#customer-name-orderForm').val(selectedCustomer.name);
        $('#customer_address-orderForm').val(selectedCustomer.address);
        $('#customer-salary-orderForm').val(selectedCustomer.salary);
    } else {
        $('#customer-name-orderForm').val('');
        $('#customer_address-orderForm').val('');
        $('#customer-salary-orderForm').val('');
    }
});

// Call the loadComboBoxes function to populate the customer ID dropdown
loadCombos(customer, 'inputGroupSelect-customer');
loadCombos(customer, 'customer-id-order');






export function loadComboItem(array, comboBoxId) {
    console.log("combo-box loaded", array, comboBoxId);
    var comboBox = $('#' + comboBoxId);

    // Clear existing options
    comboBox.empty();

    // Add a default option
    comboBox.append($('<option>', {
        value: '',
        text: 'Select Item Code...'
    }));

    // Iterate through the array and add options
    array.forEach(function (item) {
        comboBox.append($('<option>', {
            value: item.itemCode,
            text: item.itemCode
        }));
    });
}

$('#inputState-item').on('change', () => {
    var selectedCode = $('#inputState-item').val();
    var selectedItem = items.find(i => i.itemCode == selectedCode);

    if (selectedItem) {
        $('#inputPassword4').val(selectedItem.itemCode);
        $('#item-name-orderForm').val(selectedItem.name);
        $('#item-price-orderForm').val(selectedItem.price);
        $('#qtyHand').val(selectedItem.qty);
    } else {
        $('#inputPassword4').val('');
        $('#item-name-orderForm').val('');
        $('#item-price-orderForm').val('');
        $('#qtyHand').val('');
    }
});

// Call the loadComboItem function to populate the item code dropdown
loadComboItem(items, 'inputState-item');





let cart = [];

$('#btn-item').on('click', () => {
    let itemId =  $('#inputPassword4').val();
    let orderQTY = parseInt($('#order-qty').val());
    let unitPrice =  parseFloat($('#item-price-orderForm').val());
    let qty = parseInt($('#qtyHand').val());

    let total = unitPrice * orderQTY;

    if (qty >= orderQTY) {
        let cartItemIndex = cart.findIndex(cartItem => cartItem.itemId === itemId);
        if (cartItemIndex < 0) {
            let cart_item = {
                itemId: itemId,
                unitPrice: unitPrice,
                qty: orderQTY,
                total: total
            }
            cart.push(cart_item);
            loadCart();
            setTotalValues()
            clearItemSection();
          /*  clearCustomerSection();*/

        } else {
            cart[cartItemIndex].qty += orderQTY;
            cart[cartItemIndex].total = cart[cartItemIndex].qty * cart[cartItemIndex].unitPrice;
            loadCart();
            setTotalValues()
            clearItemSection();
        }
    } else {
        alert("not enough quantity in stock");
    }

});

function loadCart() {
    $('#order-table-body').empty();
    cart.map((item) => {
        $('#order-table-body').append(
            `<tr>
                <th scope="row">${item.itemId}</th>
                <td>${item.unitPrice}</td>
                <td>${item.qty}</td>
                <td>${item.total}</td>
                <td><button class="cart_remove" data-id="${item.itemId}">Remove</button></td>
            </tr>`
        );
    });
}


function calculateTotal(){
    let netTotal = 0;
    cart.map((cart_item) => {
        netTotal += cart_item.total;
    });
    console.log("net total : ", netTotal);
    return netTotal;
}

function setTotalValues(){
    let netTotal = calculateTotal();
    $('#total').val(`${netTotal}/=`);
    console.log("total : ", netTotal);

    let discount_percentage = $('#discount').val() || 0;
    let discountAmount = (netTotal * discount_percentage) / 100;
    $('#subtotal').val(`${netTotal - discountAmount}/=`);
}

function clearItemSection() {
    $('#inputPassword4').val('');
    $('#item-name-orderForm').val('');
    $('#item-price-orderForm').val('');
    $('#qtyHand').val('');
    $('#order-qty').val('');
}

function clearCustomerSection(){
    $('#customer-name-orderForm').val('');
    $('#customer_address-orderForm').val('');
    $('#customer-salary-orderForm').val('');
}

function clearPaymentSection(){
    $('#cash').val('');
    $('#balance').val('');
    $('#discount').val('');
}






function setBalance() {
    let subTotal = parseFloat($('#subtotal').val());
    let cashAmount = parseFloat($('#cash').val());
    $('#balance').val(cashAmount - subTotal);
}

$('#cash').on('input', setBalance);

$('#discount').on('input', () => {
    let discountValue = parseFloat($('#discount').val()) || 0;
    if (discountValue < 0 || discountValue > 100) {
        discountValue = Math.min(100, Math.max(0, discountValue));
        $('#discount').val(discountValue);
    }
    setTotalValues();
    setBalance();
});

$('#order-table-body').on('click', '.cart_remove', function() {
    const itemId = $(this).data('id');
    cart = cart.filter(cartItem => cartItem.itemId !== itemId);
    loadCart();
    setTotalValues();
});

$('#btn-order').on('click', () => {
    const confirmation = confirm("Do you want to proceed with the payment?");
    if (confirmation) {
        // Save the order details to the orders array
        const orderId = $('#order-id').val();
        const orderDate = $('#order-date').val();
        const customerId = $('#customer-id-order').val();

        if (!orderId || !orderDate || !customerId || cart.length === 0) {
            alert("Please fill in all the details and add at least one item to the cart.");
            return;
        }

        const newOrder = new OrderModel(orderId, orderDate, customerId, cart);
        orders.push(newOrder);

        // Clear the cart and the order form
        cart = [];
        loadCart();
        setTotalValues();
        clearCustomerSection();
        generateOrderId();
        clearPaymentSection();

        alert("Payment successful. Order has been placed.");


    }
});




$('#search-order-btn').on('click', () => {
    const selectedOrderId = $('#order-search').val();
    const selectedOrder = orders.find(order => order.orderId === selectedOrderId);

    if (selectedOrder) {
        $('#order-table-body').empty();
        selectedOrder.cart.forEach((item) => {
            $('#order-table-body').append(
                `<tr>
                    <th scope="row">${item.itemId}</th>
                    <td>${item.unitPrice}</td>
                    <td>${item.qty}</td>
                    <td>${item.total}</td>
                </tr>`
            );
        });
        $('#order-date').val(selectedOrder.orderDate);
    } else {
        alert("Order not found");
    }
});

















/*$('#btn-search-order').on('click', () => {
    const orderId = $('#order-id').val();
    const order = orders.find(o => o.orderId === orderId);

    if (!order) {
        alert("Order not found");
        return;
    }

    $('#order-date').val(order.orderDate);
    $('#customer-id-order').val(order.customerId);

    const customerDetails = customer.find(c => c.id === order.customerId);
    if (customerDetails) {
        $('#customer-name-orderForm').val(customerDetails.name);
        $('#customer_address-orderForm').val(customerDetails.address);
        $('#customer-salary-orderForm').val(customerDetails.salary);
    }

    cart = order.cart;
    loadCart();
    setTotalValues();
});


// Other existing JavaScript code...

$('#model-search').on('click', () => {
    const orderId = $('#orderId-search').val();
    const order = orders.find(o => o.orderId === orderId);

    if (!order) {
        alert("Order not found");
        return;
    }

    const firstCartItem = order.cart.length > 0 ? order.cart[0] : null;
    if (firstCartItem) {
        $('#model-itemCode').val(firstCartItem.itemId);
        $('#model-UnitPrice').val(firstCartItem.unitPrice);
        $('#model-qty').val(firstCartItem.qty);
        $('#model-total').val(firstCartItem.total);
    } else {
        alert("No items found in the order");
    }
});

$('#model-clear').on('click', () => {
  $('#search-order').modal('hide');
});*/

// Other existing JavaScript code...




// Display the order ID in the table
/*   $('#order-table-body').append(
       `<tr>
           <th colspan="5">Order ID: ${orderId}</th>
       </tr>`
   );*/

