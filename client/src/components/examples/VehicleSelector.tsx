import VehicleSelector from '../VehicleSelector';

export default function VehicleSelectorExample() {
  return (
    <div className="max-w-2xl mx-auto">
      <VehicleSelector 
        onSubmit={(info) => console.log('Vehicle info submitted:', info)}
      />
    </div>
  );
}