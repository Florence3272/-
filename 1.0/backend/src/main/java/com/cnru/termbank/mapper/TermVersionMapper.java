package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.TermVersion;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

public interface TermVersionMapper extends BaseMapper<TermVersion> {

    @Select("SELECT v.id, v.version, v.changeType, v.changeNote, v.createdAt," +
            " u.name AS changedByName FROM term_versions v" +
            " LEFT JOIN users u ON u.id = v.changedBy" +
            " WHERE v.termId = #{termId} ORDER BY v.version DESC")
    List<Map<String, Object>> listByTerm(@Param("termId") Long termId);
}
