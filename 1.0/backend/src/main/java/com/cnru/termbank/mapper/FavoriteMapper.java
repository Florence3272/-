package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.Favorite;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

public interface FavoriteMapper extends BaseMapper<Favorite> {

    @Select("SELECT f.*, t.cnTerm, t.ruTerm, t.enTerm, t.definition, t.dbId AS termDbId" +
            " FROM favorites f" +
            " LEFT JOIN terms t ON t.id = f.targetId AND f.targetType = 'term'" +
            " WHERE f.userId = #{userId} ORDER BY f.createdAt DESC")
    List<Map<String, Object>> listWithTerm(@Param("userId") Long userId);
}
