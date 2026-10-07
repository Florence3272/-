package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.UserDatabaseRole;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

public interface UserDatabaseRoleMapper extends BaseMapper<UserDatabaseRole> {

    @Select("SELECT r.id, r.userId, r.role, r.createdAt, u.username, u.name, u.avatar" +
            " FROM user_database_roles r LEFT JOIN users u ON u.id = r.userId" +
            " WHERE r.dbId = #{dbId} ORDER BY r.createdAt ASC")
    List<Map<String, Object>> listMembers(@Param("dbId") Long dbId);
}
