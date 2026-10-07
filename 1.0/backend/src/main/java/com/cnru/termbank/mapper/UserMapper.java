package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.User;
import org.apache.ibatis.annotations.Select;

public interface UserMapper extends BaseMapper<User> {

    @Select("SELECT COUNT(*) FROM users")
    long countAll();

    @Select("SELECT COUNT(*) FROM users WHERE role = #{role}")
    long countByRole(String role);
}
