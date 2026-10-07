package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.Term;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

public interface TermMapper extends BaseMapper<Term> {

    @Select("SELECT DISTINCT pos FROM terms WHERE pos IS NOT NULL AND pos <> '' AND status='active' ORDER BY pos")
    List<String> listPos();

    @Select("SELECT COUNT(*) FROM terms WHERE status='active'")
    long countActive();

    @Select("SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS count FROM terms" +
            " WHERE status='active' GROUP BY DATE_FORMAT(createdAt, '%Y-%m') ORDER BY month DESC LIMIT 12")
    List<Map<String, Object>> growthByMonth();

    /** 列出文本中命中的术语（术语库标准译法优先） */
    @Select("SELECT * FROM terms WHERE status='active' AND (" +
            "(CHAR_LENGTH(cnTerm) >= 2 AND #{text} LIKE CONCAT('%', cnTerm, '%')) OR " +
            "(CHAR_LENGTH(ruTerm) >= 3 AND #{text} LIKE CONCAT('%', ruTerm, '%')))" +
            " ORDER BY CHAR_LENGTH(cnTerm) DESC, CHAR_LENGTH(ruTerm) DESC LIMIT 50")
    List<Term> matchInText(@Param("text") String text);

    /** 全局检索（跨分库） */
    @Select("<script>" +
            "SELECT t.*, d.name AS dbName FROM terms t JOIN `databases` d ON d.id = t.dbId" +
            " WHERE t.status = 'active'" +
            "<if test='dbId != null'> AND t.dbId = #{dbId}</if>" +
            " AND (t.cnTerm LIKE CONCAT('%', #{q}, '%') OR t.ruTerm LIKE CONCAT('%', #{q}, '%')" +
            " OR t.enTerm LIKE CONCAT('%', #{q}, '%') OR t.definition LIKE CONCAT('%', #{q}, '%'))" +
            " ORDER BY t.updatedAt DESC LIMIT 100" +
            "</script>")
    List<Term> globalSearch(@Param("q") String q, @Param("dbId") Long dbId);
}
