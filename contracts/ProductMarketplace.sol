// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    struct Product {
        uint id;
        address payable owner;
        string brand;
        string name;
        string imageCID;
        uint currentPrice;
        uint oldPrice;
        uint rating;
        uint daysOnSale;
        uint createdAt;
        bool isSold;
        bool isOnSale;
        uint quantity;
    }

    uint public productCount = 0;
    mapping(uint => Product) public products;

    event ProductUploaded(
        uint id,
        address owner,
        string brand,
        string name,
        string imageCID,
        uint currentPrice,
        uint oldPrice,
        uint rating,
        uint daysOnSale,
        bool isSold,
        bool isOnSale,
        uint quantity
    );

    event ProductPurchased(uint id, address buyer, uint remainingQuantity);

    event ProductUpdated(
        uint id,
        string brand,
        string name,
        string imageCID,
        uint currentPrice,
        uint oldPrice,
        uint rating,
        uint quantity
    );

    function uploadProduct(
        string memory _name,
        string memory _imageCID,
        string memory _brand,
        uint _currentPrice,
        uint _oldPrice,
        uint _rating,
        uint daysOnSale,
        bool _isOnSale,
        uint _quantity
    ) external {
        require(_currentPrice > 0, "Current price must be greater than zero");
        require(_rating <= 5, "Rating should be between 0 and 5");
        require(_quantity > 0, "Quantity must be greater than zero");

        productCount++;
        products[productCount] = Product(
            productCount,
            payable(msg.sender),
            _brand,
            _name,
            _imageCID,
            _currentPrice,
            _oldPrice,
            _rating,
            daysOnSale,
            block.timestamp,
            false,
            _isOnSale,
            _quantity
        );

        emit ProductUploaded(
            productCount,
            msg.sender,
            _brand,
            _name,
            _imageCID,
            _currentPrice,
            _oldPrice,
            _rating,
            daysOnSale,
            false,
            _isOnSale,
            _quantity
        );
    }

    function buyProduct(uint _id) external payable {
        Product storage product = products[_id];
        require(!product.isSold, "Product already sold");
        require(msg.value == product.currentPrice, "Incorrect amount");
        require(product.quantity > 0, "Product is out of stock");
        require(
            product.owner != msg.sender,
            "Owner cannot buy their own product"
        );

        product.owner.transfer(msg.value);

        product.quantity = product.quantity - 1;

        if (product.quantity == 0) {
            product.isSold = true;
        }

        emit ProductPurchased(_id, msg.sender, product.quantity);
    }

    function updateProductInfo(
        uint _id,
        string memory _brand,
        string memory _name,
        string memory _imageCID,
        uint _currentPrice,
        uint _oldPrice,
        uint _rating,
        uint _quantity
    ) external {
        Product storage product = products[_id];
        require(
            msg.sender == product.owner,
            "Only owner can update the product"
        );
        require(!product.isSold, "Cannot update a sold product");
        require(_currentPrice > 0, "Current price must be greater than zero");
        require(_rating <= 5, "Rating should be between 0 and 5");

        product.brand = _brand;
        product.name = _name;
        product.imageCID = _imageCID;
        product.currentPrice = _currentPrice;
        product.oldPrice = _oldPrice;
        product.rating = _rating;
        product.quantity = _quantity;

        if (product.quantity > 0 && product.isSold) {
            product.isSold = false;
        }

        emit ProductUpdated(
            _id,
            _brand,
            _name,
            _imageCID,
            _currentPrice,
            _oldPrice,
            _rating,
            _quantity
        );
    }

    function getProduct(
        uint _id
    )
        external
        view
        returns (
            uint,
            address,
            string memory,
            string memory,
            string memory,
            uint,
            uint,
            uint,
            uint,
            uint,
            bool,
            bool,
            uint
        )
    {
        Product memory product = products[_id];
        return (
            product.id,
            product.owner,
            product.brand,
            product.name,
            product.imageCID,
            product.currentPrice,
            product.oldPrice,
            product.rating,
            product.daysOnSale,
            product.createdAt,
            product.isSold,
            product.isOnSale,
            product.quantity
        );
    }
}
