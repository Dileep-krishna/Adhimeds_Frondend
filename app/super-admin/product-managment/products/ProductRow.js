import { memo } from 'react';

export const ProductRow = memo(({
  product,
  onTogglePublished,
  onToggleFeatured,
  onToggleTodayDeal,
  onEdit,
  onDelete,
  onInfo,
  getImageUrl,
}) => {
  const thumbnailUrl = getImageUrl(product.thumbnail);

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center gap-2">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={product.productName}
              width="40"
              height="40"
              loading="lazy"
              decoding="async"
              style={{ objectFit: 'cover', borderRadius: '8px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div>
            <div className="fw-bold">{product.productName}</div>
            <small>{product.brand}</small>
          </div>
        </div>
      </td>
      <td>{product.brand}</td>
      <td>{product.mainCategory}</td>
      <td>
        {product.avgRating > 0 ? (
          <div>
            <div className="stars">{'⭐'.repeat(Math.floor(product.avgRating))}</div>
            <small>{product.avgRating}/5 ({product.reviewCount} reviews)</small>
          </div>
        ) : '—'}
      </td>
      <td>₹{product.unitPrice}</td>
      <td>{product.discount > 0 ? `${product.discount}%` : '—'}</td>
      <td>
        <button className="btn-icon info" onClick={() => onInfo(product._id)} title="View Details">
          <i className="bi bi-info-circle"></i>
        </button>
      </td>
      <td>
        <label className="switch">
          <input type="checkbox" checked={product.published || false} onChange={() => onTogglePublished(product._id, product.published)} />
          <span className="slider round"></span>
        </label>
      </td>
      <td>
        <label className="switch">
          <input type="checkbox" checked={product.featured || false} onChange={() => onToggleFeatured(product._id, product.featured)} />
          <span className="slider round"></span>
        </label>
      </td>
      <td>
        <label className="switch">
          <input type="checkbox" checked={product.todaysDeal || false} onChange={() => onToggleTodayDeal(product._id, product.todaysDeal)} />
          <span className="slider round"></span>
        </label>
      </td>
      <td>
        <button className="btn-icon edit" onClick={() => onEdit(product._id)}><i className="bi bi-pencil"></i></button>
        <button className="btn-icon delete" onClick={() => onDelete(product._id)}><i className="bi bi-trash"></i></button>
      </td>
    </tr>
  );
});
ProductRow.displayName = 'ProductRow';