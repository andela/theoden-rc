import React, { Component, PropTypes } from "react";
import "./firebase/firebase";
import {
  Button,
  Currency,
  DropDownMenu,
  MenuItem,
  Translation,
  Toolbar,
  ToolbarGroup,
  EditButton
} from "/imports/plugins/core/ui/client/components/";
import {
  AddToCartButton,
  ProductMetadata,
  ProductTags,
  ProductField
} from "./";
import { AlertContainer } from "/imports/plugins/core/ui/client/containers";
import { PublishContainer } from "/imports/plugins/core/revisions";

class ProductDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDigital: this.props.product.isDigital,
      downloadUrl: this.props.product.downloadLink,
      newUrl: "",
      urlFile: "",
      progressBar: false,
      progressLevel: 0,
      uploadStatus: ""
    };
    this.selectDigital = this.selectDigital.bind(this);
    this.saveUrl = this.saveUrl.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
    this.editLink = this.editLink.bind(this);
  }
  get tags() {
    return this.props.tags || [];
  }

  get product() {
    return this.props.product || {};
  }

  get editable() {
    return this.props.editable;
  }

  selectDigital() {
    this.setState({ isDigital: !this.state.isDigital });
  }

  fileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
      Alerts.toast("Select a file", "error");
      return;
    }
    if (file.size / 1000000 > 40) {
      Alerts.toast("File size more than 40 MB", "error");
      return;
    }
    $(".save").prop("disabled", true);
    const fileName = file.name;
    const storageRef = firebase.storage().ref("files");
    const spaceRef = storageRef.child(fileName);
    const uploadTask = spaceRef.put(file);
    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      this.setState({ progressLevel: progress });
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED:
          break;
        case firebase.storage.TaskState.RUNNING:
          this.setState({ progressBar: true, uploadStatus: "Uploading" });
          break;
        default:
          this.setState({ progressBar: true });
      }
    }, (error) => {
      if (error) {
        Alerts.toast("Error in uploading file", "error");
      }
    }, () => {
      const downloadURL = uploadTask.snapshot.downloadURL;
      Alerts.toast("Upload Completed", "success");
      $(".save").prop("disabled", false);
      this.setState({ newUrl: downloadURL, uploadStatus: "Uploaded" });
    });
  }
  saveUrl(event) {
    event.preventDefault();
    if (this.state.newUrl === "") {
      Alerts.toast("Please choose a file first", "error");
    }
    Meteor.call("products/updateProductField",
      this.props.product._id,
      "downloadLink",
      this.state.newUrl
    );
    Meteor.call("products/updateProductField",
      this.props.product._id,
      "isDigital",
      true
    );
    this.setState({ progressBar: false });
  }

  editLink(event) {
    event.preventDefault();
    this.setState({
      downloadUrl: ""
    });
  }

  handleVisibilityChange = (event, isProductVisible) => {
    if (this.props.onProductFieldChange) {
      this.props.onProductFieldChange(this.product._id, "isVisible", isProductVisible);
    }
  }

  handlePublishActions = (event, action) => {
    if (action === "archive" && this.props.onDeleteProduct) {
      this.props.onDeleteProduct(this.product._id);
    }
  }

  renderToolbar() {
    if (this.props.hasAdminPermission) {
      return (
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <Translation defaultValue="Product Management" i18nKey="productDetail.productManagement" />
          </ToolbarGroup>
          <ToolbarGroup>
            <DropDownMenu
              buttonElement={<Button label="Switch" />}
              onChange={this.props.onViewContextChange}
              value={this.props.viewAs}
            >
              <MenuItem label="Administrator" value="administrator" />
              <MenuItem label="Customer" value="customer" />
            </DropDownMenu>
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            <PublishContainer
              documentIds={[this.product._id]}
              documents={[this.product]}
              onVisibilityChange={this.handleVisibilityChange}
              onAction={this.handlePublishActions}
            />
          </ToolbarGroup>
        </Toolbar>
      );
    }

    return null;
  }

  render() {
    return (
      <div className="" style={{ position: "relative" }}>
        {this.renderToolbar()}

        <div className="container-main container-fluid pdp-container" itemScope itemType="http://schema.org/Product">
          <AlertContainer placement="productManagement" />



          <div className="pdp-content">
            <div className="pdp column left pdp-left-column">
              {this.props.mediaGalleryComponent}
              <ProductTags editable={this.props.editable} product={this.product} tags={this.tags} />
              <ProductMetadata editable={this.props.editable} product={this.product} />
            </div>

            <div className="pdp column right pdp-right-column">

            <header className="pdp header">
            <ProductField
              editable={this.editable}
              fieldName="title"
              fieldTitle="Title"
              element={<h1 />}
              onProductFieldChange={this.props.onProductFieldChange}
              product={this.product}
              textFieldProps={{
                i18nKeyPlaceholder: "productDetailEdit.title",
                placeholder: "Title"
              }}
            />

            <ProductField
              editable={this.editable}
              fieldName="pageTitle"
              fieldTitle="Sub Title"
              element={<h2 />}
              onProductFieldChange={this.props.onProductFieldChange}
              product={this.product}
              textFieldProps={{
                i18nKeyPlaceholder: "productDetailEdit.pageTitle",
                placeholder: "Subtitle"
              }}
            />
          </header>

              <div className="pricing">
                <div className="left">
                  <span className="price">
                    <span id="price">
                      <Currency amount={this.props.priceRange} />
                    </span>
                  </span>
                </div>
                <div className="right">
                  {this.props.socialComponent}
                </div>
              </div>


              <div className="vendor">
                <ProductField
                  editable={this.editable}
                  fieldName="vendor"
                  fieldTitle="Vendor"
                  onProductFieldChange={this.props.onProductFieldChange}
                  product={this.product}
                  textFieldProps={{
                    i18nKeyPlaceholder: "productDetailEdit.vendor",
                    placeholder: "Vendor"
                  }}
                />
              </div>

              <div className="pdp product-info">
                <ProductField
                  editable={this.editable}
                  fieldName="description"
                  fieldTitle="Description"
                  multiline={true}
                  onProductFieldChange={this.props.onProductFieldChange}
                  product={this.product}
                  textFieldProps={{
                    i18nKeyPlaceholder: "productDetailEdit.description",
                    placeholder: "Description"
                  }}
                />
              </div>
              {(this.props.hasAdminPermission) ?
                <div>
                  <div>
                    <input type="checkbox" className="digital-check"
                      defaultChecked={this.state.isDigital}
                      onChange={this.selectDigital}
                    />
                    <label className="digital">Digital Product</label>
                  </div>
                  <div>
                    {(this.state.isDigital && this.state.downloadUrl === "") ?
                      < div className="input-group downloadLink">
                        <input type="file" className="form-control choose" id="file"
                          onChange={this.fileUpload}
                        />
                        <span className="input-group-btn">
                          <Button id="upload"
                            onClick={this.saveUrl}
                            label="save"
                            className="form-control up-button save"
                          />
                        </span>
                      </div> : <div />}
                    {this.state.progressBar &&
                      <div className="progress">
                        <div className="progress-bar progress-bar-striped active" role="progressbar" style={{ width: `${this.state.progressLevel}%` }} >
                          {this.state.uploadStatus}</div>
                      </div>}

                    {(this.state.isDigital && this.state.downloadUrl !== "") ?
                      <div className="row downloadLink">
                        <div className="col-sm-11 digital-input">
                          <input type="text" disabled
                            placeholder={this.state.downloadUrl}
                          />
                        </div>
                        <div className="col-sm-1">
                          <EditButton
                            onClick={this.editLink}
                          />
                        </div>
                      </div> : <div />
                    }
                  </div>
                </div>
                : <div />
              }
              {(this.state.isDigital && !this.props.hasAdminPermission) ?
                <div><h4>This is a Digital Product</h4></div> : <div />
              }
              <div className="options-add-to-cart">
                {this.props.topVariantComponent}
              </div>
              <hr />
              <div>
                <AlertContainer placement="productDetail" />
                <AddToCartButton
                  cartQuantity={this.props.cartQuantity}
                  onCartQuantityChange={this.props.onCartQuantityChange}
                  onClick={this.props.onAddToCart}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

ProductDetail.propTypes = {
  cartQuantity: PropTypes.number,
  editable: PropTypes.bool,
  hasAdminPermission: PropTypes.bool,
  mediaGalleryComponent: PropTypes.node,
  onAddToCart: PropTypes.func,
  onCartQuantityChange: PropTypes.func,
  onDeleteProduct: PropTypes.func,
  onProductFieldChange: PropTypes.func,
  onViewContextChange: PropTypes.func,
  priceRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  product: PropTypes.object,
  socialComponent: PropTypes.node,
  tags: PropTypes.arrayOf(PropTypes.object),
  topVariantComponent: PropTypes.node,
  viewAs: PropTypes.string
};

export default ProductDetail;
