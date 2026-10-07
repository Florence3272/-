package com.cnru.termbank.common;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/** 分页结果 */
@Data
public class PageResult<T> implements Serializable {
    private List<T> list;
    private long total;
    private long page;
    private long pageSize;
    private long totalPages;

    public PageResult() {}

    public PageResult(List<T> list, long total, long page, long pageSize) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
        this.totalPages = pageSize > 0 ? (total + pageSize - 1) / pageSize : 0;
    }
}
