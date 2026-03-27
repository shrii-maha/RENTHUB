import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const ItemCard = ({ item }) => {
  return (
    <div className="item-card flex flex-col h-full fade-in">
      <Link to={`/item/${item._id}`} className="item-card-image block relative flex-shrink-0">
        {item.imageFilename ? (
          <img 
            src={getImageUrl(item.imageFilename)} 
            alt={item.name} 
            className="w-full h-full object-cover p-2" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
            No Preview
          </div>
        )}
      </Link>
      
      <div className="flex flex-col flex-grow pt-2">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-800 leading-tight flex-grow pr-2">
            <Link to={`/item/${item._id}`}>{item.name}</Link>
          </h3>
          <span className="item-price-badge whitespace-nowrap">
            ₹{item.rentalPrice}/day
          </span>
        </div>
        
        <div className="mb-4">
          <span className="item-category-tag">
            {item.category?.toLowerCase() || 'other'}
          </span>
        </div>
        
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
          {item.description}
        </p>
        
        <div className="mt-auto">
          <Link 
            to={`/item/${item._id}`} 
            className="btn btn-outline w-full text-sm font-bold py-3 hover:bg-slate-50 transition-all border-[#6366f1] text-[#6366f1]"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
