package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.TermDatabase;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface TermDatabaseMapper extends BaseMapper<TermDatabase> {

    @Select("SELECT DISTINCT category FROM `databases` WHERE status='active' ORDER BY category")
    List<String> listCategories();

    @Select("SELECT COUNT(*) FROM `databases` WHERE status='active'")
    long countActive();

    /** 分库列表（带库主名与成员数）；applyVisibility=false 表示系统管理员不过滤可见性 */
    @Select("<script>" +
            "SELECT d.*, u.name AS ownerName, u.username AS ownerUsername," +
            " (SELECT COUNT(*) FROM user_database_roles r WHERE r.dbId = d.id) AS memberCount" +
            " FROM `databases` d LEFT JOIN users u ON u.id = d.ownerId" +
            " WHERE d.status = 'active'" +
            "<if test='search != null and search != \"\"'> AND d.name LIKE CONCAT('%', #{search}, '%')</if>" +
            "<if test='category != null and category != \"\"'> AND d.category = #{category}</if>" +
            "<if test='mineUserId != null'> AND (d.ownerId = #{mineUserId} OR d.id IN (SELECT dbId FROM user_database_roles WHERE userId = #{mineUserId}))</if>" +
            "<if test='applyVisibility'>" +
            "  <if test='viewerId != null'> AND (d.visibility = 'public' OR d.ownerId = #{viewerId} OR d.id IN (SELECT dbId FROM user_database_roles WHERE userId = #{viewerId}))</if>" +
            "  <if test='viewerId == null'> AND d.visibility = 'public'</if>" +
            "</if>" +
            " ORDER BY d.updatedAt DESC" +
            "</script>")
    List<TermDatabase> listWithOwner(@Param("search") String search,
                                     @Param("category") String category,
                                     @Param("mineUserId") Long mineUserId,
                                     @Param("viewerId") Long viewerId,
                                     @Param("applyVisibility") boolean applyVisibility);
}
