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
        bool isOnSale
    );

    event ProductPurchased(uint id, address buyer);

    event ProductUpdated(
        uint id,
        string brand,
        string name,
        string imageCID,
        uint currentPrice,
        uint oldPrice,
        uint rating
    );

    function uploadProduct(
        string memory _name,
        string memory _imageCID,
        string memory _brand,
        uint _currentPrice,
        uint _oldPrice,
        uint _rating,
        uint daysOnSale,
        bool _isOnSale
    ) external {
        require(_currentPrice > 0, "Current price must be greater than zero");
        require(_rating <= 5, "Rating should be between 0 and 5");

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
            _isOnSale
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
            _isOnSale
        );
    }

    function buyProduct(uint _id) external payable {
        Product storage product = products[_id];
        require(!product.isSold, "Product already sold");
        require(msg.value == product.currentPrice, "Incorrect amount");
        require(
            product.owner != msg.sender,
            "Owner cannot buy their own product"
        );

        product.owner.transfer(msg.value);
        product.isSold = true;

        emit ProductPurchased(_id, msg.sender);
    }

    function updateProductInfo(
        uint _id,
        string memory _brand,
        string memory _name,
        string memory _imageCID,
        uint _currentPrice,
        uint _oldPrice,
        uint _rating
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

        emit ProductUpdated(
            _id,
            _brand,
            _name,
            _imageCID,
            _currentPrice,
            _oldPrice,
            _rating
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
            bool
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
            product.isOnSale
        );
    }
}
