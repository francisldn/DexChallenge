//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

interface IUniswapV2Pair {
    function getReserves()
        external
        view
        returns (
            uint112 reserve0,
            uint112 reserve1,
            uint32 blockTimestampLast
        );

    function price0CumulativeLast() external view returns (uint256);

    function price1CumulativeLast() external view returns (uint256);

    function kLast() external view returns (uint256);

    function swap(
        uint256 amount0Out,
        uint256 amount1Out,
        address to,
        bytes calldata data
    ) external;
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB)
        external
        view
        returns (address pair);
}

interface IUniswapV2Router02 {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function getAmountsOut(uint256 amountIn, address[] memory path)
        external
        view
        returns (uint256[] memory amounts);
}

contract GSRChallenge2PoolArbitrage is Ownable {
    function maxArbitragePossible(
        address _token0,
        address _token1,
        address _router0,
        address _router1
    ) public view returns (uint256 price0, uint256 price1) {
        // Implement code to calculate the maximum amount of arbitrage that can be traded for
        price0 = _getPrice2(_token0, _token1, _router0);
        price1 = _getPrice2(_token0, _token1, _router1);
    }

    function executeArb(
        address _token0,
        address _token1,
        address _router0,
        address _router1,
        uint256 _amount0
    ) external onlyOwner returns (uint256 amountOut, uint256 arbProfit) {
        (uint256 price0, uint256 price1) = maxArbitragePossible(
            _token0,
            _token1,
            _router0,
            _router1
        );
        uint256 arbitrage = (price0 > price1)
            ? ((price0 - price1) * 100) / price0
            : ((price1 - price0) * 100) / price1;
        // to check that price differential is greater than 1%
        require(arbitrage > 1, "no_arbitrage");
        require(
            ERC20(_token0).balanceOf(address(this)) >= _amount0,
            "insufficient_fund"
        );
        uint256 _amount1;
        if (price0 > price1) {
            // sell token0 and swap for token1 at dex0
            _swapToken(_token0, _token1, _amount0, _router0);
            _amount1 = ERC20(_token1).balanceOf(address(this));
            // sell token1 and swap for token0 at dex1
            _swapToken(_token1, _token0, _amount1, _router1);
            amountOut = ERC20(_token0).balanceOf(address(this));
        } else if (price0 < price1) {
            _swapToken(_token0, _token1, _amount0, _router1);
            _amount1 = ERC20(_token1).balanceOf(address(this));
            _swapToken(_token1, _token0, _amount1, _router0);
            amountOut = ERC20(_token0).balanceOf(address(this));
        }
        if (amountOut <= _amount0) {
            arbProfit = 0;
        } else if (amountOut > _amount0) {
            arbProfit = amountOut - _amount0;
        }
    }

    function withdrawToken(address token, address to) public onlyOwner {
        require(
            ERC20(token).transfer(to, ERC20(token).balanceOf(address(this))),
            "transfer_failed"
        );
    }

    function getTokenBalance(address token) external view returns (uint256) {
        return ERC20(token).balanceOf(address(this));
    }

    function _depositToken(address token, uint256 amount) public {
        require(
            ERC20(token).transferFrom(msg.sender, address(this), amount),
            "transfer_failed"
        );
    }

    // swap between 2 ERC20 tokens through router.swapExactTokensForTokens() function
    function _swapToken(
        address token0,
        address token1,
        uint256 amountIn,
        address routerAdd
    ) public returns (uint256 amount1) {
        require(amountIn > 0, "invalid_amount");
        require(routerAdd != address(0), "invalid_address");
        require(
            token0 != token1 && token0 != address(0) && token1 != address(0),
            "invalid pair"
        );
        address[] memory path = new address[](2);
        path[0] = token0;
        path[1] = token1;
        IUniswapV2Router02 exchange = IUniswapV2Router02(routerAdd);
        ERC20(token0).approve(routerAdd, amountIn);
        exchange.swapExactTokensForTokens(
            amountIn,
            0,
            path,
            address(this),
            block.timestamp + 60
        );
        amount1 = ERC20(token1).balanceOf(address(this));
        require(amount1 > 0, "swap_failed");
    }

    // get liquidity pool Pair address from factory contract
    function _getPairAddress(
        address _token0,
        address _token1,
        address _factory
    ) public view returns (address) {
        IUniswapV2Factory factory = IUniswapV2Factory(_factory);
        return factory.getPair(_token0, _token1);
    }

    // get exchange rate for token0/token1 from Pair reserves
    function _getPrice(
        address _token0,
        address _token1,
        address factory
    ) public view returns (uint256) {
        address pairAddress = _getPairAddress(_token0, _token1, factory);
        require(pairAddress != address(0), "Pool_does_not_exist");
        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);

        (uint256 res0, uint256 res1, ) = pair.getReserves();
        // 8 decimals
        uint256 PRICE_DECIMALS = 1e18;
        return (res0 * PRICE_DECIMALS) / res1;
    }

    // get exchange rate for token0/token1 from router.getAmountsOut() function
    function _getPrice2(
        address _token0,
        address _token1,
        address routerAdd
    ) public view returns (uint256) {
        IUniswapV2Router02 router = IUniswapV2Router02(routerAdd);
        address[] memory path = new address[](2);
        path[0] = _token0;
        path[1] = _token1;
        uint256[] memory result = router.getAmountsOut(1e18, path);
        uint256 PRICE_DECIMALS = 1e18;
        return (result[1] * PRICE_DECIMALS) / result[0];
    }
}
