package com.auction.auction_system.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.auction.auction_system.model.Bid;
import java.util.*;

public interface BidRepository extends JpaRepository<Bid, Long>{
	
    List<Bid> findByProductIdOrderByAmountDesc(Long productId);

    List<Bid> findByUserIdOrderByBidTimeDesc(Long userId);
    

}
