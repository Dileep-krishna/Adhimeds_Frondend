import { memo } from 'react';

export const SkeletonRow = memo(() => (
  <tr className="skeleton-row">
    <td><div className="skeleton" style={{ width: '120px', height: '40px' }}></div></td>
    <td><div className="skeleton" style={{ width: '80px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '100px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '80px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '60px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '50px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></div></td>
    <td><div className="skeleton" style={{ width: '40px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '40px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '40px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '70px', height: '30px' }}></div></td>
  </tr>
));
SkeletonRow.displayName = 'SkeletonRow';