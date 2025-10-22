// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TalentRankVoting is SepoliaConfig, Ownable, ReentrancyGuard {
    struct Candidate {
        uint256 id;
        string name;
        string description;
        string imageURI; // e.g., IPFS URI
        euint32 voteCount; // encrypted vote counter
    }

    event CandidateRegistered(uint256 indexed id, string name);
    event Voted(address indexed voter, uint256 indexed candidateId);
    event VotingEnded(uint256 timestamp);
    event DecryptGranted(address indexed user);

    uint64 public startTime;
    uint64 public endTime;
    bool public votingEnded;

    Candidate[] private _candidates;
    mapping(address => bool) private _hasVoted;
    euint32 private _totalVotes; // encrypted total votes
    mapping(address => euint32) private _userVoteEncrypted; // encrypted candidateId per user

    constructor(address initialOwner) Ownable(initialOwner) {}

    // ------------------------
    // Admin
    // ------------------------
    function registerCandidate(
        string memory name,
        string memory imageURI,
        string memory description
    ) external onlyOwner {
        uint256 id = _candidates.length;
        Candidate memory c;
        c.id = id;
        c.name = name;
        c.description = description;
        c.imageURI = imageURI;
        // voteCount defaults to 0 (encrypted zero)
        _candidates.push(c);
        emit CandidateRegistered(id, name);
    }

    function setVotingWindow(uint64 startTimestamp, uint64 endTimestamp) external onlyOwner {
        require(endTimestamp > startTimestamp, "Invalid window");
        startTime = startTimestamp;
        endTime = endTimestamp;
    }

    function endVoting() external onlyOwner {
        require(!votingEnded, "Already ended");
        votingEnded = true;
        emit VotingEnded(block.timestamp);
    }

    // ------------------------
    // Voting
    // ------------------------
    function vote(uint256 candidateId) external nonReentrant {
        require(!votingEnded, "Voting ended");
        if (startTime != 0 && endTime != 0) {
            require(block.timestamp >= startTime && block.timestamp <= endTime, "Out of window");
        }
        require(!_hasVoted[msg.sender], "Already voted");
        require(candidateId < _candidates.length, "Bad candidate");

        Candidate storage c = _candidates[candidateId];

        // Encrypted increment by scalar 1
        c.voteCount = FHE.add(c.voteCount, 1);
        // Keep ACL permissive for transparency and follow-up computations
        FHE.allowThis(c.voteCount);
        // Optionally allow voter to decrypt their affected value (not necessary for public clear read)
        FHE.allow(c.voteCount, msg.sender);

        // Maintain encrypted total votes as well
        _totalVotes = FHE.add(_totalVotes, 1);
        FHE.allowThis(_totalVotes);

        _hasVoted[msg.sender] = true;

        // Store the user's chosen candidateId as encrypted value so that only the user can decrypt it
        euint32 encChoice = FHE.asEuint32(uint32(candidateId));
        _userVoteEncrypted[msg.sender] = encChoice;
        FHE.allow(_userVoteEncrypted[msg.sender], msg.sender);
        emit Voted(msg.sender, candidateId);
    }

    // ------------------------
    // Views – encrypted handles (for Relayer SDK / Mock decryption)
    // ------------------------
    function getCandidate(uint256 id) external view returns (
        uint256 candidateId,
        string memory name,
        string memory description,
        string memory imageURI,
        euint32 voteCount
    ) {
        require(id < _candidates.length, "Bad candidate");
        Candidate storage c = _candidates[id];
        return (c.id, c.name, c.description, c.imageURI, c.voteCount);
    }

    function getCandidateCount(uint256 id) external view returns (euint32) {
        require(id < _candidates.length, "Bad candidate");
        return _candidates[id].voteCount;
    }

    function getAllCandidates() external view returns (Candidate[] memory) {
        return _candidates;
    }

    function hasVoted(address user) external view returns (bool) {
        return _hasVoted[user];
    }

    function getTotalVotes() external view returns (euint32) {
        return _totalVotes;
    }

    function getMyVoteEncrypted() external view returns (euint32) {
        return _userVoteEncrypted[msg.sender];
    }

    // ------------------------
    // Admin – grant decryption permission for scoreboard
    // ------------------------
    function grantDecryptionTo(address user) external onlyOwner {
        require(user != address(0), "bad user");
        // allow user to decrypt all candidate counters and total
        for (uint256 i = 0; i < _candidates.length; i++) {
            FHE.allow(_candidates[i].voteCount, user);
        }
        FHE.allow(_totalVotes, user);
        emit DecryptGranted(user);
    }

    // ------------------------
    // Public – self authorize to view aggregated counters
    // ------------------------
    function authorizeViewer() external {
        for (uint256 i = 0; i < _candidates.length; i++) {
            FHE.allow(_candidates[i].voteCount, msg.sender);
        }
        FHE.allow(_totalVotes, msg.sender);
    }

    // No on-chain public clear decryption in this version.
}


