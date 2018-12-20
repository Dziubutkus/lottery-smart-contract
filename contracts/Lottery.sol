pragma solidity >=0.4.0 <0.6.0;

import "./Pausable.sol";
import "./SafeMath.sol";
import "./OraclizeAPI.sol";

contract Lottery is usingOraclize, Pausable {
    using SafeMath for uint;

    uint public ticketPrice;
    uint public endingTime;
    uint public ticketsSold;
    uint public uniqueOwners;
    uint public ticketAmount;
    uint public ticketsPerPerson;
    uint public fee;
    uint public winner;
    address payable public winnerAddress;
    
    bool winningsProcessed = false;

    event LotteryCreated(uint ticketPrice, uint endingTime, uint ticketAmount, uint ticketsPerPerson, uint fee);
    event LotteryCanceled(); 
    event LotteryFinished(address winner, uint ticketsSold, uint amountWon); 
    event TicketPurchased(address buyer);
    event NewOraclizeQuery(string description);
    event RandomNumberGenerated(uint number);

    enum State {Active, Inactive}
    State state;

    address payable[] public uniqueTicketOwners;
    mapping (uint => address payable) ticketToOwner;
    mapping (address => uint) ownerTicketCount;
    mapping(bytes32=>bool) validIds;


    /**
    * @dev For an unlimited amount of tickets in the lottery for its duration, set ticketAmount = 1.
    */
    constructor(uint _ticketPrice, uint _ticketsPerPerson, uint _fee, uint _endingTime, uint _ticketAmount) public {
        require(_ticketPrice > 0, "Invalid ticket price");
        require(_endingTime > block.timestamp, "Invalid ending time");
        require(_ticketAmount > 0, "Invalid ticket amount");
        ticketPrice = _ticketPrice * 1 finney;
        ticketsPerPerson = _ticketsPerPerson;
        fee = _fee;
        endingTime = _endingTime;
        ticketAmount = _ticketAmount;
        ticketsSold = 0;
        state = State.Active;
    }

    /**
    * @dev Copy of constructor, used to reinitiate lottery
    */
    function restartLottery(uint _ticketPrice, uint _ticketsPerPerson, uint _fee, uint _endingTime, uint _ticketAmount) public onlyOwner {
        require(state == State.Inactive, "Lottery is active");
        require(ticketsSold == 0 && uniqueOwners == 0 && endingTime == 0, "Lottery must be cleaned");
        require(_ticketPrice > 0, "Invalid ticket price");
        require(_endingTime > block.timestamp, "Invalid ending time");
        require(_ticketAmount > 0, "Invalid ticket amount");
        ticketPrice = _ticketPrice * 1 finney;
        ticketsPerPerson = _ticketsPerPerson;
        fee = _fee;
        endingTime = _endingTime;
        ticketAmount = _ticketAmount;
        winnerAddress = address(0);
        winningsProcessed = false;
        state = State.Active;

        emit LotteryCreated(ticketPrice, endingTime, ticketAmount, ticketsPerPerson, fee);
    }

    function() external payable {
        buyTicket();
    }

    function _cleanLottery() internal onlyOwner {
        //require(_lotteryEnded(), "Lottery is ongoing.");
        for (uint i = 0; i < uniqueOwners; i++) {
            delete ownerTicketCount[uniqueTicketOwners[i]];
        }
        for (uint j = 0; j < ticketsSold; j++) {
            delete ticketToOwner[j];
        }
        endingTime = 0;
        ticketsSold = 0;
        uniqueOwners = 0;
        ticketsPerPerson = 0;
        state = State.Inactive;
    }

    function buyTicket() public payable {
        require(!_lotteryEnded(), "Lottery has finished.");
        require(ownerTicketCount[msg.sender] < ticketsPerPerson, "You already have the maximum amount of tickets.");
        require(msg.value == ticketPrice, "Incorrect sum paid");
        ticketToOwner[ticketsSold] = msg.sender;
        ticketsSold = ticketsSold.add(1);
        ownerTicketCount[msg.sender] = ownerTicketCount[msg.sender].add(1);
        if(ownerTicketCount[msg.sender] == 1) {
            uniqueTicketOwners.push(msg.sender);
            uniqueOwners = uniqueOwners.add(1);
        }

        emit TicketPurchased(msg.sender);
    } 

    /**
    * @dev Cancels the lottery by setting the ending time to the current time, then returns ticket sales
    */
    function cancelLottery() public onlyOwner {
        endingTime = block.timestamp;
        for(uint i = 0; i < uniqueOwners; i++) { //  Checks-Effects-Interactions pattern (https://solidity.readthedocs.io/en/develop/security-considerations.html#re-entrancy)
            uint refundAmount = ownerTicketCount[uniqueTicketOwners[i]] * ticketPrice;
            ownerTicketCount[uniqueTicketOwners[i]] = 0;
            uniqueTicketOwners[i].transfer(refundAmount);
        }
        emit LotteryCanceled();
        _cleanLottery();
    }

    /**
    * @dev If ticketAmount is greater than 1, compare number to ticketsSold. 
    *      Check if timestamp >= endingTime either way. 
    *      If either condition is true, the lottery is ended.
    */
    function _lotteryEnded() private view returns (bool) {
        return (ticketAmount != 1) ? (ticketAmount == ticketsSold || block.timestamp >= endingTime) : block.timestamp >= endingTime;
    }

    /**
    * @dev Send lotteryWinner their reward
    */
    function finishLottery() public payable onlyOwner {
        require(_lotteryEnded(), "Lottery is still ongoing.");
        _generateWinner();
    }

    // TODO: maybe private?
    function _generateWinner() internal {
        require(_lotteryEnded(), "Lottery is still ongoing.");
        emit NewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        bytes32 queryId = oraclize_query("WolframAlpha", strConcat("random number between 0 and ", uint2str(ticketsSold-1)));
        validIds[queryId] = true;
    }

    // Reverts sending money (calling proccessWinnings())
    function __callback(bytes32 myid, string memory result) public {
        require(msg.sender != oraclize_cbAddress(), "msg.sender is not oraclize");
        require(validIds[myid]);
        winner = parseInt(result); 
        winnerAddress = ticketToOwner[winner];
        
        emit RandomNumberGenerated(winner);
    }
    
    function proccessWinnings() external onlyOwner {
        require(winnerAddress != address(0), "Oracle's did not complete the query yet");
        require(winningsProcessed == false, "Winnings were already processed");
        uint amountWon = ticketsSold.mul(ticketPrice);
        uint winningFee = amountWon.mul(fee).div(100);
        amountWon = amountWon.sub(winningFee);
        
        winnerAddress.transfer(amountWon);
        owner.transfer(address(this).balance);
        
        winningsProcessed = true;
        
        emit LotteryFinished(winnerAddress, ticketsSold, amountWon);
        _cleanLottery();
    }
    
    function lotteryEnded() public view returns(bool){
        return _lotteryEnded();
    }
}