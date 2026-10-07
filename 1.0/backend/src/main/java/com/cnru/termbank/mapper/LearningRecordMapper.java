package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.LearningRecord;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

public interface LearningRecordMapper extends BaseMapper<LearningRecord> {

    @Select("SELECT COUNT(*) FROM learning_records")
    long countAll();

    @Select("SELECT mode, COUNT(*) AS count, AVG(score) AS avgScore FROM learning_records" +
            " WHERE userId = #{userId} GROUP BY mode")
    List<Map<String, Object>> statsByMode(@Param("userId") Long userId);

    @Select("SELECT r.id, r.mode, r.targetType, r.targetId, r.createdAt, u.username, u.name" +
            " FROM learning_records r LEFT JOIN users u ON u.id = r.userId" +
            " ORDER BY r.createdAt DESC LIMIT 10")
    List<Map<String, Object>> recentWithUser();
}
