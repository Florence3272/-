package com.cnru.termbank.config;

import com.cnru.termbank.entity.User;
import com.cnru.termbank.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 首次启动时若 users 表为空，自动创建演示账号：
 *   admin / admin123（管理员）、student / student123（学生）
 */
@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public ApplicationRunner initUsers(UserMapper userMapper, PasswordEncoder encoder) {
        return args -> {
            try {
                Long count = userMapper.selectCount(null);
                if (count != null && count > 0) return;

                User admin = new User();
                admin.setUsername("admin");
                admin.setPasswordHash(encoder.encode("admin123"));
                admin.setName("系统管理员");
                admin.setEmail("admin@example.com");
                admin.setRole("admin");
                admin.setStatus("active");
                userMapper.insert(admin);

                User student = new User();
                student.setUsername("student");
                student.setPasswordHash(encoder.encode("student123"));
                student.setName("示例学生");
                student.setEmail("student@example.com");
                student.setRole("student");
                student.setStatus("active");
                userMapper.insert(student);

                log.info("已初始化演示账号: admin/admin123, student/student123");
            } catch (Exception e) {
                log.warn("初始化账号跳过: {}", e.getMessage());
            }
        };
    }
}
