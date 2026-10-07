package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.AuditLog;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

public interface AuditLogMapper extends BaseMapper<AuditLog> {

    @Select("SELECT a.*, u.username, u.name FROM audit_logs a LEFT JOIN users u ON u.id = a.userId" +
            " ORDER BY a.createdAt DESC LIMIT #{limit}")
    List<Map<String, Object>> listWithUser(@Param("limit") int limit);
}
