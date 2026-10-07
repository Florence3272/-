package com.cnru.termbank;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.cnru.termbank.mapper")
public class TermBankApplication {
    public static void main(String[] args) {
        SpringApplication.run(TermBankApplication.class, args);
        System.out.println("\n🚀 中俄能源装备术语库 后端启动成功: http://localhost:8080/api\n");
    }
}
