import customStyles from "../styles/global.css";
import invariant from "tiny-invariant";
import type {
     MetaFunction,
     LinksFunction,
    LoaderFunction,
  } from "@remix-run/node";
import { json, } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";

export const meta: MetaFunction = () => {
    return [
        {
        title: "Loadboard | Complete your registration",
        description: "Complete your registration to access the loadboard.",
        },
    ];
};
  
export const links: LinksFunction = () => [
...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

// Define a type for your loader data for better type-checking
// Define a type for your loader data that matches the structure of the data you're returning.
export type LoaderData = {
    roles: {
      [key: string]: string;
    };
};

// // Your loader function
export const loader: LoaderFunction = async () => {
    // Here you can fetch and return any data needed for your form
    const roles = {
        "Support": "support",
        "Owner Operator": "owner_operator",
        "Fleet Owner": "fleet_owner",
        "Dispatcher": "dispatcher", 
        "Independent Carrier": "independent_carrier",
        "Gov. Carrier": "gov_carrier",
        "Corporate Carrier": "corporate_carrier",
        "Admin": "admin"
      // ... other roles
    };
  
    return json({ roles });
  };

export default function ConfirmEmailPage() {
    const { roles }: LoaderData = useLoaderData();
    const inputStyle = `border border-slate-400 rounded py-2 px-3 inline-block w-full`;
   
    // State to track the selected role
    const [selectedRole, setSelectedRole] = useState('');
    const [vehicles, setVehicles] = useState({
        Trucks: false,
        Boats: false,
        Vans: false,
        Cargoes: false,
    });

    // Determine if the user is a Fleet Owner or Driver
    const isFleetOwner= ["fleet_owner"].includes(selectedRole);
    const isOwnerOperator= ["owner_operator"].includes(selectedRole);
    
    const handleVehicleChange = (e) => {
        const { name, checked } = e.target;
        setVehicles(prevVehicles => ({ ...prevVehicles, [name]: checked }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white py-8 px-6 shadow-2xl rounded-lg sm:px-10" style={{ maxWidth: '600px' }}>
                <Form className="mb-0 space-y-6" method="post">
                {/* <Form className="mb-0 space-y-6" method="post"> */}
                <h2 className="text-lg font-bold text-center mb-4">
                    Welcome to loadboard! Please complete your profile.
                </h2>
                <p className="text-sm text-center mb-8">Tell us a little bit more about you</p>
                <div className="grid grid-cols-2 gap-4">
                    <input type="email" name="email" className={inputStyle} placeholder="Your username" required />
                    <input type="text" name="firstName" minLength = {3} className={inputStyle} placeholder="Your First Name" required />
                    <input type="text" name="lastName" minLength = {3} className={inputStyle} placeholder="Your Last Name" required />
                    <input type="text" name="companyName" minLength = {3} className={inputStyle} placeholder="Company Name" required />
                    <input type="text" name="dotNumber" minLength = {6} className={inputStyle} placeholder="Dot Registration Number" required />
                    <select  name="role"
                        className={inputStyle}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        required>
                        <option defaultChecked value="">Select Role</option>
                        
                        {Object.entries(roles).map(([name, value]) => (
                            <option key={value} value={value}>{name}</option>
                        ))}
                    </select>

                    {/* Conditional Vehicle Type and Quantity Inputs */}

                    {/* Conditional Vehicle Type and Quantity Inputs */}
                    {isOwnerOperator && (
                        <div className="col-span-2 flex flex-wrap gap-4">
                             {["Trucks", "Boats", "Vans", "Cargoes"].map((vehicle) => (
                                <div key={vehicle}>
                                    <label className="px-4">
                                        <input
                                            type="checkbox"
                                            name={vehicle}
                                            onChange={handleVehicleChange}
                                        />
                                        {vehicle}
                                    </label>
                                    {vehicles[vehicle] && (
                                        <input
                                            type="number"
                                            name={`${vehicle.toLowerCase()}Quantity`}
                                            className="w-20"
                                            placeholder="Qty"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {isFleetOwner && (
                        <div className="col-span-2 flex flex-wrap gap-4">
                            <div>
                                <p>Fleet:</p>
                                <label className="px-4">
                                    <input type="checkbox" name="vehicleType" value="Trucks" /> Trucks
                                </label>
                                <label className="px-4">
                                    <input type="checkbox" name="vehicleType" value="Boats" /> Boats
                                </label>
                                <label className="px-4">
                                    <input type="checkbox" name="vehicleType" value="Vans" /> Vans
                                </label>
                                <label className="px-4">
                                    <input type="checkbox" name="vehicleType" value="Cargoes" /> Cargoes
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Conditional Fleet Size Radios */}
                    {selectedRole === "fleet_owner" && (
                        <div className="col-span-2">
                            <p>Fleet Size:</p>
                            <label className="px-6"><input type="radio" name="fleetSize" value="1-2" /> 1-2</label>
                            <label className="px-6"><input type="radio" name="fleetSize" value="3-10" /> 3-10</label>
                            <label className="px-4"><input type="radio" name="fleetSize" value="11-25" /> 11-25</label>
                            <label className="px-3"><input type="radio" name="fleetSize" value="26-50" /> 26-50</label>
                            <label className="px-5"><input type="radio" name="fleetSize" value="50+" /> 50+</label>
                        </div>
                    )}
                </div>
                <button type="submit" className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Next
                </button>
            </Form>
        </div>
    </div>
    );
}
