package com.auction.auction_system;

import org.springframework.boot.SpringApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
@EnableScheduling
public class AuctionSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuctionSystemApplication.class, args);
	}

}
